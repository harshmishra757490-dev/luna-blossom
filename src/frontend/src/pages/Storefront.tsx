import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@tanstack/react-router";
import { Heart, Instagram, Search, ShoppingBag, User } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Product } from "../backend";
import { useGetAllProducts } from "../hooks/useQueries";

const CATEGORIES = ["Hair", "Jewelry", "Bags", "Kids", "Other"];
const NAV_LINKS = ["New", "Hair", "Jewelry", "Bags", "Kids", "Sale"];

const CATEGORY_IMAGES: Record<string, string> = {
  Hair: "/assets/generated/category-hair.dim_400x400.jpg",
  Jewelry: "/assets/generated/category-jewelry.dim_400x400.jpg",
  Bags: "/assets/generated/category-bags.dim_400x400.jpg",
  Kids: "/assets/generated/category-kids.dim_400x400.jpg",
  Other: "/assets/generated/category-other.dim_400x400.jpg",
};

const INSTAGRAM_IMAGES = [
  "https://picsum.photos/seed/insta1/300/300",
  "https://picsum.photos/seed/insta2/300/300",
  "https://picsum.photos/seed/insta3/300/300",
  "https://picsum.photos/seed/insta4/300/300",
  "https://picsum.photos/seed/insta5/300/300",
];

function ProductCard({ product, index }: { product: Product; index: number }) {
  const imageUrl = product.image.getDirectURL();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-soft transition-shadow"
      data-ocid={`product.item.${index + 1}`}
    >
      <div className="aspect-square overflow-hidden bg-accent/30">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="font-sans font-medium text-foreground truncate mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-1 capitalize">
          {product.category}
        </p>
        <p className="font-sans font-bold text-foreground mb-3">
          ${product.price.toFixed(2)}
        </p>
        <Button
          className="w-full bg-primary text-primary-foreground hover:opacity-90 rounded-lg text-sm"
          data-ocid={`product.button.${index + 1}`}
        >
          Add to Bag
        </Button>
      </div>
    </motion.div>
  );
}

function EmptyProducts() {
  return (
    <div
      className="col-span-4 flex flex-col items-center justify-center py-20 text-center"
      data-ocid="product.empty_state"
    >
      <div className="w-20 h-20 rounded-full bg-accent/50 flex items-center justify-center mb-6">
        <ShoppingBag className="w-8 h-8 text-primary/60" />
      </div>
      <h3 className="font-serif text-xl text-foreground mb-2">
        No products yet
      </h3>
      <p className="text-muted-foreground text-sm max-w-xs">
        Our collection is coming soon. Check back for beautiful new arrivals!
      </p>
      <Link to="/admin">
        <Button
          variant="outline"
          className="mt-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          data-ocid="empty.admin_link"
        >
          Admin — Add Products
        </Button>
      </Link>
    </div>
  );
}

export default function Storefront() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");
  const [activeNav, setActiveNav] = useState("New");
  const [bagCount] = useState(0);

  const { data: products = [], isLoading } = useGetAllProducts();

  const filteredProducts = useMemo(() => {
    let result = products;
    if (searchQuery.trim()) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (filterCategory && filterCategory !== "all") {
      result = result.filter(
        (p) => p.category.toLowerCase() === filterCategory.toLowerCase(),
      );
    }
    if (filterPrice === "under25") result = result.filter((p) => p.price < 25);
    else if (filterPrice === "25to50")
      result = result.filter((p) => p.price >= 25 && p.price <= 50);
    else if (filterPrice === "over50")
      result = result.filter((p) => p.price > 50);
    return result;
  }, [products, searchQuery, filterCategory, filterPrice]);

  return (
    <div className="min-h-screen bg-background">
      {/* Promo Bar */}
      <div className="bg-secondary text-secondary-foreground text-center py-2 px-4 text-xs tracking-widest uppercase font-sans">
        Free shipping on orders over $50 · New arrivals every Friday
      </div>

      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Spacer */}
          <div className="flex-1" />
          {/* Logo */}
          <div className="flex-1 flex justify-center">
            <Link to="/" className="text-center">
              <div className="font-script text-4xl text-foreground leading-none">
                Luna
              </div>
              <div className="font-serif text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-light mt-0.5">
                & Blossom
              </div>
            </Link>
          </div>
          {/* Utility */}
          <div className="flex-1 flex items-center justify-end gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 h-8 text-sm w-44 bg-input border-border rounded-full"
                data-ocid="header.search_input"
              />
            </div>
            <button
              type="button"
              className="p-1.5 hover:text-primary transition-colors"
              aria-label="Account"
              data-ocid="header.user_button"
            >
              <User className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-1.5 hover:text-primary transition-colors"
              aria-label="Wishlist"
              data-ocid="header.heart_button"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="relative p-1.5 hover:text-primary transition-colors"
              aria-label="Bag"
              data-ocid="header.bag_button"
            >
              <ShoppingBag className="w-5 h-5" />
              {bagCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {bagCount}
                </span>
              )}
            </button>
            <Link
              to="/admin"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-1"
              data-ocid="header.admin_link"
            >
              Admin
            </Link>
          </div>
        </div>
        {/* Navigation */}
        <nav className="border-t border-border">
          <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center justify-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                type="button"
                key={link}
                onClick={() => setActiveNav(link)}
                className={`font-sans text-sm tracking-wide transition-colors ${
                  activeNav === link
                    ? "text-primary border-b border-primary pb-0.5"
                    : "text-foreground hover:text-primary"
                }`}
                data-ocid={`nav.${link.toLowerCase()}.tab`}
              >
                {link}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <img
            src="/assets/generated/hero-accessories.dim_1400x600.jpg"
            alt="Luna & Blossom collection"
            className="w-full h-[480px] sm:h-[560px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/40 via-foreground/10 to-transparent" />
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute left-12 top-1/2 -translate-y-1/2 max-w-sm"
          >
            <p className="font-serif text-xs tracking-[0.25em] uppercase text-primary-foreground/80 mb-3">
              New Arrivals
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl text-primary-foreground leading-tight mb-6">
              Curated for
              <br />
              <em>Little Loves</em>
            </h1>
            <Button
              className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-8 py-2.5 font-sans text-sm"
              data-ocid="hero.shop_button"
            >
              Shop the Collection
            </Button>
          </motion.div>
        </section>

        {/* Shop by Category */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <h2 className="font-serif text-2xl sm:text-3xl uppercase tracking-[0.12em] text-foreground mb-2">
                Shop by Category
              </h2>
              <p className="text-muted-foreground font-sans text-sm">
                Find exactly what you&apos;re looking for
              </p>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {CATEGORIES.map((cat, i) => (
                <motion.button
                  type="button"
                  key={cat}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setFilterCategory(cat.toLowerCase())}
                  className="group flex flex-col items-center gap-3"
                  data-ocid={`category.${cat.toLowerCase()}.button`}
                >
                  <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-card group-hover:shadow-soft transition-shadow">
                    <img
                      src={CATEGORY_IMAGES[cat]}
                      alt={cat}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <span className="font-sans text-sm text-foreground group-hover:text-primary transition-colors">
                    {cat}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section className="py-12 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-serif text-2xl sm:text-3xl uppercase tracking-[0.12em] text-foreground">
                  Our Latest Loves
                </h2>
                <p className="text-muted-foreground font-sans text-sm mt-1">
                  {filteredProducts.length} piece
                  {filteredProducts.length !== 1 ? "s" : ""}
                </p>
              </motion.div>
              {/* Filter Panel */}
              <div
                className="bg-card border border-border rounded-xl shadow-card p-4 flex gap-3 flex-wrap"
                data-ocid="filter.panel"
              >
                <div>
                  <p className="text-[10px] font-sans uppercase tracking-wider text-muted-foreground mb-1">
                    Category
                  </p>
                  <Select
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                  >
                    <SelectTrigger
                      className="h-8 w-32 text-xs border-border"
                      data-ocid="filter.category.select"
                    >
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c.toLowerCase()}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-[10px] font-sans uppercase tracking-wider text-muted-foreground mb-1">
                    Price
                  </p>
                  <Select value={filterPrice} onValueChange={setFilterPrice}>
                    <SelectTrigger
                      className="h-8 w-36 text-xs border-border"
                      data-ocid="filter.price.select"
                    >
                      <SelectValue placeholder="Any price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any price</SelectItem>
                      <SelectItem value="under25">Under $25</SelectItem>
                      <SelectItem value="25to50">$25 – $50</SelectItem>
                      <SelectItem value="over50">Over $50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(filterCategory !== "all" || filterPrice !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterCategory("all");
                      setFilterPrice("all");
                    }}
                    className="self-end h-8 px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    data-ocid="filter.clear_button"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {["a", "b", "c", "d", "e", "f", "g", "h"].map((k) => (
                  <div
                    key={k}
                    className="rounded-xl overflow-hidden bg-card shadow-card animate-pulse"
                    data-ocid="product.loading_state"
                  >
                    <div className="aspect-square bg-accent/40" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-accent/40 rounded w-3/4" />
                      <div className="h-3 bg-accent/30 rounded w-1/2" />
                      <div className="h-8 bg-accent/30 rounded mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="grid grid-cols-1">
                <EmptyProducts />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((p, i) => (
                  <ProductCard key={p.name} product={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Instagram Section */}
        <section className="py-16 px-6 bg-secondary/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Instagram className="w-4 h-4 text-primary" />
                <span className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                  Follow us @lunaandblossom
                </span>
              </div>
              <h2 className="font-serif text-2xl uppercase tracking-[0.12em] text-foreground">
                As Seen on Instagram
              </h2>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {INSTAGRAM_IMAGES.map((src, idx) => (
                <motion.a
                  key={src}
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="aspect-square rounded-xl overflow-hidden group block"
                  data-ocid={`instagram.item.${idx + 1}`}
                >
                  <img
                    src={src}
                    alt={`Instagram post ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="font-script text-3xl text-foreground leading-none mb-1">
                Luna
              </div>
              <div className="font-serif text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
                & Blossom
              </div>
              <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                Curated accessories for the girls who love to express
                themselves.
              </p>
            </div>
            {/* Shop Links */}
            <div>
              <h4 className="font-serif text-xs uppercase tracking-widest text-foreground mb-4">
                Shop
              </h4>
              <ul className="space-y-2">
                {[
                  "New Arrivals",
                  "Hair",
                  "Jewelry",
                  "Bags",
                  "Kids",
                  "Sale",
                ].map((l) => (
                  <li key={l}>
                    <Link
                      to="/"
                      className="font-sans text-xs text-muted-foreground hover:text-foreground transition-colors"
                      data-ocid={`footer.shop_${l.toLowerCase().replace(" ", "_")}.link`}
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* Help Links */}
            <div>
              <h4 className="font-serif text-xs uppercase tracking-widest text-foreground mb-4">
                Help
              </h4>
              <ul className="space-y-2">
                {[
                  "Shipping & Returns",
                  "Size Guide",
                  "FAQ",
                  "Contact Us",
                  "Privacy Policy",
                ].map((l) => (
                  <li key={l}>
                    <Link
                      to="/"
                      className="font-sans text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* Connect */}
            <div>
              <h4 className="font-serif text-xs uppercase tracking-widest text-foreground mb-4">
                Connect
              </h4>
              <p className="font-sans text-xs text-muted-foreground mb-3">
                Get 10% off your first order.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="your@email.com"
                  className="h-8 text-xs bg-input border-border flex-1"
                  data-ocid="footer.email_input"
                />
                <Button
                  className="h-8 px-3 text-xs bg-primary text-primary-foreground hover:opacity-90"
                  data-ocid="footer.subscribe_button"
                >
                  Join
                </Button>
              </div>
              <div className="flex gap-3 mt-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-10 pt-6 text-center">
            <p className="font-sans text-xs text-muted-foreground">
              © {new Date().getFullYear()} Luna & Blossom. Built with ♥ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline underline-offset-2"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
