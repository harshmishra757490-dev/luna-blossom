import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Loader2,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";
import { ExternalBlob } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddProduct,
  useDeleteProduct,
  useGetAllProducts,
  useIsCallerAdmin,
  useUpdateProduct,
} from "../hooks/useQueries";

const CATEGORIES = ["Hair", "Jewelry", "Bags", "Kids", "Other"];

type ProductFormData = {
  name: string;
  description: string;
  price: string;
  category: string;
  imageFile: File | null;
  existingImageUrl?: string;
};

const emptyForm = (): ProductFormData => ({
  name: "",
  description: "",
  price: "",
  category: "Hair",
  imageFile: null,
});

function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center px-6"
      data-ocid="admin.login.page"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-card border border-border rounded-2xl shadow-soft p-10 max-w-sm w-full text-center"
      >
        <div className="font-script text-5xl text-foreground leading-none mb-1">
          Luna
        </div>
        <div className="font-serif text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-8">
          & Blossom · Admin
        </div>
        <p className="font-sans text-sm text-muted-foreground mb-6">
          Sign in to manage your store products and inventory.
        </p>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="w-full bg-primary text-primary-foreground hover:opacity-90 rounded-full"
          data-ocid="admin.login.primary_button"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" /> Sign In
            </>
          )}
        </Button>
        <div className="mt-6">
          <Link
            to="/"
            className="font-sans text-xs text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="admin.back_to_store.link"
          >
            ← Back to Store
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function AccessDenied() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl text-foreground mb-3">
          Access Restricted
        </h2>
        <p className="font-sans text-sm text-muted-foreground mb-6">
          You don&apos;t have admin permissions for this store.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => {
              clear();
              queryClient.clear();
            }}
            data-ocid="access_denied.logout_button"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
          <Link to="/">
            <Button
              className="bg-primary text-primary-foreground hover:opacity-90"
              data-ocid="access_denied.back_button"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: products = [], isLoading: productsLoading } =
    useGetAllProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm());
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthenticated) return <LoginScreen />;
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2
          className="animate-spin text-primary w-8 h-8"
          data-ocid="admin.loading_state"
        />
      </div>
    );
  }
  if (!isAdmin) return <AccessDenied />;

  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyForm());
    setPreviewUrl(null);
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      imageFile: null,
      existingImageUrl: product.image.getDirectURL(),
    });
    setPreviewUrl(product.image.getDirectURL());
    setShowForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, imageFile: file }));
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.category) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!editingProduct && !form.imageFile) {
      toast.error("Please select an image.");
      return;
    }
    setIsSubmitting(true);
    setUploadProgress(0);
    try {
      let imageBlob: ExternalBlob;
      if (form.imageFile) {
        const bytes = new Uint8Array(await form.imageFile.arrayBuffer());
        imageBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(pct),
        );
      } else if (editingProduct) {
        imageBlob = editingProduct.image;
      } else {
        throw new Error("No image provided");
      }

      const productData: Product = {
        name: form.name,
        description: form.description,
        price: Number.parseFloat(form.price),
        category: form.category,
        image: imageBlob,
        createdAt: editingProduct?.createdAt ?? BigInt(Date.now()),
      };

      if (editingProduct) {
        await updateProduct.mutateAsync(productData);
        toast.success("Product updated!");
      } else {
        await addProduct.mutateAsync(productData);
        toast.success("Product added!");
      }
      setShowForm(false);
      setPreviewUrl(null);
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (name: string) => {
    try {
      await deleteProduct.mutateAsync(name);
      toast.success("Product deleted.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete");
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="admin.back_button"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="font-script text-2xl text-foreground leading-none">
                Luna
              </div>
              <div className="font-serif text-[8px] tracking-[0.3em] uppercase text-muted-foreground">
                & Blossom · Admin
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clear();
              queryClient.clear();
            }}
            className="text-muted-foreground hover:text-foreground text-xs"
            data-ocid="admin.logout_button"
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl text-foreground">
              Product Management
            </h1>
            <p className="text-muted-foreground font-sans text-sm mt-1">
              {products.length} product{products.length !== 1 ? "s" : ""} in
              store
            </p>
          </div>
          <Button
            onClick={openAdd}
            className="bg-primary text-primary-foreground hover:opacity-90 rounded-full"
            data-ocid="admin.add_product.primary_button"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>

        {productsLoading ? (
          <div
            className="flex justify-center py-20"
            data-ocid="admin.products.loading_state"
          >
            <Loader2 className="animate-spin text-primary w-7 h-7" />
          </div>
        ) : products.length === 0 ? (
          <div
            className="text-center py-20 bg-card rounded-2xl border border-border"
            data-ocid="admin.products.empty_state"
          >
            <p className="font-serif text-xl text-foreground mb-2">
              No products yet
            </p>
            <p className="font-sans text-sm text-muted-foreground mb-6">
              Add your first product to get started.
            </p>
            <Button
              onClick={openAdd}
              className="bg-primary text-primary-foreground hover:opacity-90"
              data-ocid="admin.empty.add_button"
            >
              <Plus className="mr-2 h-4 w-4" /> Add First Product
            </Button>
          </div>
        ) : (
          <div
            className="bg-card rounded-2xl border border-border overflow-hidden shadow-card"
            data-ocid="admin.products.table"
          >
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="font-sans text-xs uppercase tracking-wider text-muted-foreground">
                    Image
                  </TableHead>
                  <TableHead className="font-sans text-xs uppercase tracking-wider text-muted-foreground">
                    Name
                  </TableHead>
                  <TableHead className="font-sans text-xs uppercase tracking-wider text-muted-foreground">
                    Category
                  </TableHead>
                  <TableHead className="font-sans text-xs uppercase tracking-wider text-muted-foreground">
                    Price
                  </TableHead>
                  <TableHead className="font-sans text-xs uppercase tracking-wider text-muted-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, i) => (
                  <TableRow
                    key={product.name}
                    className="border-border"
                    data-ocid={`admin.product.item.${i + 1}`}
                  >
                    <TableCell>
                      <img
                        src={product.image.getDirectURL()}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    </TableCell>
                    <TableCell>
                      <p className="font-sans font-medium text-foreground">
                        {product.name}
                      </p>
                      <p className="font-sans text-xs text-muted-foreground truncate max-w-[200px]">
                        {product.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="font-sans text-xs bg-accent/50 text-accent-foreground px-2 py-0.5 rounded-full">
                        {product.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-sans font-bold text-foreground">
                        ${product.price.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(product)}
                          className="h-8 w-8 p-0 hover:bg-accent/50"
                          data-ocid={`admin.product.edit_button.${i + 1}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                              data-ocid={`admin.product.delete_button.${i + 1}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent data-ocid="admin.delete.dialog">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-serif">
                                Delete Product
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete{" "}
                                <strong>{product.name}</strong>? This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-ocid="admin.delete.cancel_button">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(product.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                data-ocid="admin.delete.confirm_button"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* Product Form Dialog */}
      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          if (!open) {
            setShowForm(false);
            setPreviewUrl(null);
          }
        }}
      >
        <DialogContent
          className="max-w-lg"
          data-ocid="admin.product_form.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="prod-name"
                className="font-sans text-xs uppercase tracking-wider"
              >
                Name *
              </Label>
              <Input
                id="prod-name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Pearl Hair Clip"
                disabled={!!editingProduct}
                className="bg-input border-border"
                data-ocid="admin.product_form.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="prod-desc"
                className="font-sans text-xs uppercase tracking-wider"
              >
                Description
              </Label>
              <Textarea
                id="prod-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="A delicate pearl-embellished hair clip..."
                rows={3}
                className="bg-input border-border resize-none"
                data-ocid="admin.product_form.description.textarea"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="prod-price"
                  className="font-sans text-xs uppercase tracking-wider"
                >
                  Price ($) *
                </Label>
                <Input
                  id="prod-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, price: e.target.value }))
                  }
                  placeholder="24.99"
                  className="bg-input border-border"
                  data-ocid="admin.product_form.price.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-sans text-xs uppercase tracking-wider">
                  Category *
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
                >
                  <SelectTrigger
                    className="bg-input border-border"
                    data-ocid="admin.product_form.category.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Image Upload */}
            <div className="space-y-1.5">
              <Label className="font-sans text-xs uppercase tracking-wider">
                Image {!editingProduct && "*"}
              </Label>
              <button
                type="button"
                onClick={triggerFileInput}
                onKeyDown={(e) => e.key === "Enter" && triggerFileInput()}
                className="w-full border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors text-left"
                data-ocid="admin.product_form.dropzone"
              >
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-32 w-full object-contain rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewUrl(null);
                        setForm((p) => ({ ...p, imageFile: null }));
                      }}
                      className="absolute top-1 right-1 bg-foreground/80 text-background rounded-full p-0.5"
                      data-ocid="admin.product_form.remove_image.button"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground py-4">
                    <Upload className="w-8 h-8" />
                    <p className="font-sans text-sm">Click to upload image</p>
                    <p className="font-sans text-xs">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                data-ocid="admin.product_form.upload_button"
              />
            </div>
            {/* Upload Progress */}
            {isSubmitting && uploadProgress > 0 && (
              <div
                className="space-y-1.5"
                data-ocid="admin.product_form.loading_state"
              >
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading image...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setPreviewUrl(null);
              }}
              disabled={isSubmitting}
              data-ocid="admin.product_form.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:opacity-90"
              data-ocid="admin.product_form.submit_button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : editingProduct ? (
                "Save Changes"
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
