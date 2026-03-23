# Luna & Blossom - Girls Accessories Shop

## Current State
New project with no existing application files.

## Requested Changes (Diff)

### Add
- Public storefront displaying girls accessories (hair, jewelry, bags, kids)
- Product grid with category filters and search
- Product cards with image, name, price, and category
- Admin panel (login-protected) to add, edit, and delete products
- Product image upload via blob storage
- Role-based access: admin vs. public visitor
- Sample/seed accessories data for initial display

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: Product CRUD (create, read, update, delete) with fields: id, name, description, price, category, imageUrl, createdAt
2. Backend: Authorization for admin role
3. Backend: Blob storage for product images
4. Frontend: Public storefront with hero, category navigation, product grid, filters
5. Frontend: Admin dashboard with product management (add/edit/delete, image upload)
6. Frontend: Login page for admin access
