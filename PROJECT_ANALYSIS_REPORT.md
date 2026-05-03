# Ruvali E-commerce — Full Project Analysis Report

> **Note (2026):** This report described a **`saas-backend`** (Postgres/Prisma) tree that has been removed from this monoreclone. Operations use **`ruvali-backend`** and Hostinger MySQL. Sections below referencing **`saas-backend`** are historical unless updated manually.

**Date:** January 28, 2025    
**Scope:** Frontend + Backend (no changes made)

---

## 1. Project Structure

### Frontend (React app at project root)

```
ruvali-ecommerce/
├── public/
│   └── index.html
├── src/
│   ├── Assets/Images/
│   │   ├── landingpageBg.png
│   │   └── Logo.png
│   ├── components/
│   │   ├── AdminLayout/
│   │   ├── AnimatedPage/
│   │   ├── Breadcrumbs/
│   │   ├── CategorySidebar/
│   │   ├── CheckoutModal/
│   │   ├── DebugPanel/
│   │   ├── FeaturedPicks/
│   │   ├── Footer/
│   │   ├── Header/
│   │   ├── Hero/
│   │   ├── InfoPage/
│   │   ├── LuxuryHero/
│   │   ├── MainLayout/
│   │   ├── ProductCard/
│   │   ├── ProductCardSkeleton/
│   │   ├── ProductDetail/
│   │   ├── ProtectedRoute/
│   │   └── TopNav/
│   ├── context/
│   │   ├── CartContext.js
│   │   └── StoreContext.js
│   ├── hooks/
│   │   ├── useAdminCategories.js
│   │   ├── useAdminOrders.js
│   │   ├── useAdminProducts.js
│   │   ├── useCategories.js
│   │   ├── useProducts.js
│   │   └── useScrollPosition.js
│   ├── lib/
│   │   ├── apiClient.js
│   │   ├── imageUtils.js
│   │   └── slugUtils.js
│   │   └── toast.js
│   ├── pages/
│   │   ├── About/
│   │   ├── Admin/
│   │   │   ├── AdminCategories/
│   │   │   ├── AdminDashboard/
│   │   │   ├── AdminLogin/
│   │   │   ├── AdminOrders/
│   │   │   ├── AdminProductForm/
│   │   │   ├── AdminProducts/
│   │   │   └── AdminSettings/
│   │   ├── Cart/
│   │   ├── CategoryPage/
│   │   ├── Checkout/
│   │   ├── Contact/
│   │   ├── Donate/
│   │   ├── FAQ/
│   │   ├── Home/
│   │   ├── OrderConfirmation/
│   │   ├── Payment/
│   │   ├── Returns/
│   │   ├── Shipping/
│   │   ├── SizeGuide/
│   │   └── TrackOrder/
│   ├── App.js
│   ├── App.css
│   ├── config.js
│   └── index.css
├── .env.example
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── (docs: ARCHITECTURE_AND_PRODUCTION.md, DEPLOYMENT.md, etc.)
```

### Backend (saas-backend/)

```
saas-backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/
│       ├── 20260127000000_init_saas_schema/
│       ├── 20260128000000_add_category_parent/
│       ├── 20260128100000_category_fix/
│       ├── 20260228120000_add_category_banner_slug/
│       └── 20260228120001_add_category_sort_order/
├── src/
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── env.js
│   │   └── prisma.js
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   ├── category.controller.js
│   │   ├── order.controller.js
│   │   ├── product.controller.js
│   │   ├── store.controller.js
│   │   └── upload.controller.js
│   ├── middleware/
│   │   ├── authAdmin.js
│   │   ├── errorHandler.js
│   │   ├── requestLogger.js
│   │   └── requireStore.js
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── categories.routes.js
│   │   ├── orders.routes.js
│   │   ├── products.routes.js
│   │   ├── store.routes.js
│   │   └── uploads.routes.js
│   ├── services/
│   │   ├── admin.service.js
│   │   ├── category.service.js
│   │   ├── cloudinary.service.js
│   │   ├── order.service.js
│   │   ├── product.service.js
│   │   ├── store.service.js
│   │   ├── whatsapp.service.js
│   │   └── (upload logic in upload.controller)
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── httpError.js
│   │   └── status.js
│   ├── app.js
│   └── server.js
├── Dockerfile
├── nixpacks.toml
├── package.json
├── railpack.json
├── railway.json
└── render.yaml
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, React Router 6, TanStack Query, Ant Design, Framer Motion, Tailwind CSS |
| **Backend** | Node.js, Express 4 |
| **ORM** | Prisma |
| **Database** | PostgreSQL |
| **Image storage** | Cloudinary (production) / local `uploads/` (dev fallback) |
| **Auth** | JWT (Bearer) for admin; bcrypt for passwords; no customer auth |
| **Hosting config** | Render (backend), Vercel (frontend per DEPLOYMENT.md) |

### Config Files

| File | Purpose |
|------|---------|
| `.env.example` | Frontend: only documents `REACT_APP_IS_TESTING`; no backend vars |
| `src/config.js` | Frontend: `isTesting = true` hardcoded (local vs prod API) |
| `saas-backend/render.yaml` | Render: web service, NODE_ENV=production |
| `saas-backend/nixpacks.toml` | Nixpacks build phases |
| `saas-backend/Dockerfile` | Runs `prisma migrate deploy`, seed, then start |
| `postcss.config.js`, `tailwind.config.js` | Frontend build |
| No `vercel.json` | Vercel uses defaults |

---

## 2. Backend — API Routes

| Method | Path | What it does | Filter by store? | Admin auth? |
|--------|------|--------------|-----------------|-------------|
| GET | `/health` | Health check | N/A | No |
| POST | `/api/admin/login` | Admin login (email, password) → JWT + store | No | No |
| GET | `/api/store/:slug` | Get store by slug (public) | Yes (by slug) | No |
| PUT | `/api/store` | Update store branding | Yes (admin's store) | Yes |
| POST | `/api/store/revalidate` | Bump store updatedAt | Yes (admin's store) | Yes |
| GET | `/api/products` | List products (query: storeSlug, categoryId) | Yes (storeSlug) | No |
| GET | `/api/products/admin` | List products for admin's store | Yes (admin store) | Yes |
| GET | `/api/products/:id` | Get single product (admin) | Yes (admin store) | Yes |
| POST | `/api/products` | Create product | Yes (admin store) | Yes |
| PUT | `/api/products/:id` | Update product | Yes (admin store) | Yes |
| DELETE | `/api/products/:id` | Delete product | Yes (admin store) | Yes |
| GET | `/api/categories` | List categories (query: storeSlug) | Yes (storeSlug) | No |
| GET | `/api/categories/admin` | List categories for admin | Yes (admin store) | Yes |
| POST | `/api/categories` | Create category | Yes (admin store) | Yes |
| PUT | `/api/categories/reorder` | Reorder categories | Yes (admin store) | Yes |
| PUT | `/api/categories/:id/banner` | Upload & save category banner | Yes (admin store) | Yes |
| PUT | `/api/categories/:id` | Update category | Yes (admin store) | Yes |
| DELETE | `/api/categories/:id` | Delete category | Yes (admin store) | Yes |
| POST | `/api/orders` | Create order (query: storeSlug) | Yes (storeSlug) | No |
| GET | `/api/orders` | List orders for admin's store | Yes (admin store) | Yes |
| PUT | `/api/orders/:id/status` | Update order status | Yes (admin store) | Yes |
| POST | `/api/upload/image` | Upload image (field: image) | Yes (admin storeId in folder) | Yes |

**Note:** Public routes use `storeSlug` (query or `x-store-slug` header). Admin routes use JWT to infer `storeId`.

---

## 3. Database Schema

### Enums

- **ThemeMode:** LIGHT, DARK
- **OrderStatus:** PLACED, CONFIRMED, PACKED, SHIPPED, DELIVERED

### Models

| Model | Fields | Relationships | Indexes |
|-------|--------|---------------|---------|
| **Store** | id (cuid), name, slug (unique), logo?, primaryColor?, secondaryColor?, backgroundImage?, whatsappNumber, currency (default INR), themeMode (default DARK), createdAt, updatedAt | → AdminUser[], Customer[], Category[], Product[], Order[] | slug |
| **AdminUser** | id, email (unique), password, storeId, createdAt, updatedAt | → Store | storeId |
| **Customer** | id, name, phone, storeId, createdAt, updatedAt | → Store, Order[] | storeId; unique(storeId, phone) |
| **Category** | id, name, slug?, bannerImage?, parentId?, sortOrder (default 0), storeId, createdAt, updatedAt | → Store, Category (parent/children), Product[] | storeId, parentId |
| **Product** | id, name, description?, price (Decimal), images (String[]), stock (default 0), categoryId, storeId, createdAt, updatedAt | → Category, Store, OrderItem[] | storeId, categoryId |
| **Order** | id, customerId, storeId, status (OrderStatus), totalAmount (Decimal), shippingInfo (Json?), createdAt, updatedAt | → Customer, Store, OrderItem[], OrderStatusLog[] | storeId, customerId |
| **OrderItem** | id, orderId, productId, quantity, price (Decimal), createdAt, updatedAt | → Order, Product | orderId, productId |
| **OrderStatusLog** | id, orderId, oldStatus?, newStatus, timestamp, whatsappTo?, messageText?, providerMessageId?, createdAt, updatedAt | → Order | orderId, timestamp |

### Foreign Keys & Cascade

- AdminUser.storeId → Store (CASCADE)
- Customer.storeId → Store (CASCADE)
- Category.parentId → Category (SET NULL)
- Category.storeId → Store (CASCADE)
- Product.categoryId → Category (RESTRICT)
- Product.storeId → Store (CASCADE)
- Order.customerId → Customer (RESTRICT)
- Order.storeId → Store (CASCADE)
- OrderItem.orderId → Order (CASCADE)
- OrderItem.productId → Product (RESTRICT)
- OrderStatusLog.orderId → Order (CASCADE)

---

## 4. Frontend — Pages & Components

### Customer Perspective

| Page/Component | What customer can do |
|----------------|----------------------|
| **Home** | View hero, curated category sections, featured products |
| **CategoryPage** (`/c`, `/c/:slug`, `/c/:parent/:sub`) | Browse products by category, open product detail, add to cart, buy now |
| **ProductDetail** (modal) | View product, select quantity/color, add to cart, buy now |
| **Cart** | View cart, update quantity, remove items, go to checkout |
| **Checkout** | Enter shipping details, proceed to payment |
| **Payment** | Choose payment (card/UPI/COD), enter details, place order |
| **OrderConfirmation** | See order summary, shipping, payment; print receipt |
| **Shipping** | Static shipping info (InfoPage) |
| **Returns** | Static returns info |
| **FAQ** | Static FAQ |
| **SizeGuide** | Static size guide |
| **TrackOrder** | Form for order ID + email; **no API** — shows generic message |
| **About** | Static about |
| **Donate** | Static donate |
| **Contact** | Static contact |
| **TopNav** | Shop, categories, About, Donate, cart icon |
| **Footer** | Category links, customer care links, payment methods |

### Admin Perspective

| Page | What admin can do |
|------|-------------------|
| **AdminLogin** | Login with email/password → JWT stored in localStorage |
| **AdminDashboard** | Dashboard (basic) |
| **AdminProducts** | List products, filter by category, add/edit/delete |
| **AdminProductForm** | Create/edit product (name, category, price, image, description, stock) |
| **AdminCategories** | List categories, create, edit, delete, reorder, upload banner |
| **AdminOrders** | List orders, filter by status, update status (PLACED→…→DELIVERED) |
| **AdminSettings** | Edit store name, logo, colors, theme, background, WhatsApp number |
| **ProtectedRoute** | Redirects to /admin/login if no adminToken |
| **AdminLayout** | Sidebar with links to dashboard, products, categories, orders, settings |

---

## 5. Image Handling

### Where images are uploaded

- **Production:** Cloudinary (required; local storage is ephemeral on Render)
- **Development:** If Cloudinary is not configured, falls back to local `uploads/` directory

### API routes for uploads

| Route | Purpose |
|-------|---------|
| `POST /api/upload/image` | Single image upload (field: `image`); used by Admin Product Form, Admin Settings (logo, background), Admin Categories (banner) |

### Cloudinary wiring

- **Config:** `saas-backend/src/config/cloudinary.js` reads `CLOUDINARY_*` env vars
- **Service:** `cloudinary.service.js` — `uploadImageBuffer()` uses upload_stream
- **Upload controller:** Uses `uploadBufferToUrl()` which:
  - Tries Cloudinary first
  - In production: throws 503 if Cloudinary not configured
  - In dev: falls back to local file if Cloudinary fails
- **Frontend:** `resolveImageUrl()` in `imageUtils.js` — relative paths get `apiBaseUrl` prefix; full URLs passed through

### Gaps

- Product schema supports `images` (array) but AdminProductForm only handles a single image
- Local uploads on Render are lost on restart
- No image validation (size, type) on backend

---

## 6. Order Flow

### Step-by-step

1. **Cart / Checkout**
   - Customer adds items to cart (CartContext, in-memory)
   - Or uses “Buy Now” → CheckoutModal with single product

2. **Checkout page**
   - Customer fills shipping (fullName, email, phone, city, address, state, pincode, country)
   - Frontend builds `orderData` with `orderId: RUVALI-{timestamp}`, items, shippingAddress, totalAmount (subtotal only), orderDate
   - Calls `saveOrderDetails(orderData)` and `clearCart()`
   - Navigates to `/payment` with `state: { orderData }`

3. **Payment page**
   - Customer selects payment method (card / UPI / COD)
   - For card: enters card number, name, expiry, CVV (not validated, mock only)
   - On submit:
     - Builds `orderItems` from `orderData.items` or single product
     - **POST** `{backendUrl}/api/orders?storeSlug={storeSlug}` with:
       ```json
       {
         "customer": { "name": "...", "phone": "..." },
         "items": [{ "productId": "...", "quantity": 1 }],
         "shippingInfo": { fullName, email, phone, city, address, state, pincode, country }
       }
       ```
     - On success: stores `backendOrder` in `paymentData`, navigates to `/order-confirmation`
     - On failure: logs error, still navigates; order is not in backend

4. **Backend order creation**
   - `requireStore` resolves store from `storeSlug`
   - Creates or finds Customer by phone
   - Validates products exist and belong to store
   - Computes `totalAmount` from product prices × quantities (no shipping)
   - Creates Order (PLACED), OrderItems, OrderStatusLog
   - Sends WhatsApp notification (if Twilio configured)
   - Returns created order

5. **Order confirmation**
   - Shows `orderData.orderId` (RUVALI-{timestamp}), not backend `order.id`
   - Shows shipping, payment method, total (includes ₹100 shipping on frontend only)

6. **Admin order management**
   - Admin sees orders in Admin Orders
   - Can change status: PLACED → CONFIRMED → PACKED → SHIPPED → DELIVERED
   - Status change triggers WhatsApp (if configured)

### Payment step

- **No real payment:** Card/UPI/COD are mock; no Razorpay/Stripe
- Order is created on “Pay” / “Confirm Order” regardless of method

### Data mismatch

- Frontend shows `totalAmount + 100` (shipping); backend stores only product total
- Order confirmation shows `RUVALI-{timestamp}` instead of backend order ID

---

## 7. Environment Variables

| Variable | Used by | Required? | Notes |
|----------|---------|-----------|-------|
| **Frontend** | | | |
| `REACT_APP_IS_TESTING` | config / apiClient | Optional | Overrides `isTesting`; not in .env.example |
| `REACT_APP_API_URL` | apiClient | Optional | Override API URL when `isTesting=false` |
| **Backend** | | | |
| `NODE_ENV` | env.js | Optional | Default: development |
| `PORT` | env.js | Optional | Default: 5005 |
| `DATABASE_URL` | Prisma | **Required** | PostgreSQL connection string |
| `CORS_ORIGINS` | env.js | Optional | Default: http://localhost:3000 |
| `ADMIN_JWT_SECRET` | env.js | Optional | Default: `change-me` (insecure) |
| `ADMIN_JWT_EXPIRES_IN` | env.js | Optional | Default: 7d |
| `CLOUDINARY_CLOUD_NAME` | env.js | Required in prod | Empty = no Cloudinary |
| `CLOUDINARY_API_KEY` | env.js | Required in prod | |
| `CLOUDINARY_API_SECRET` | env.js | Required in prod | |
| `TWILIO_ACCOUNT_SID` | env.js | Optional | For WhatsApp |
| `TWILIO_AUTH_TOKEN` | env.js | Optional | |
| `TWILIO_WHATSAPP_FROM` | env.js | Optional | Default: whatsapp:+14155238886 |

### Status

- **Required but missing from .env.example:** DATABASE_URL, ADMIN_JWT_SECRET, CLOUDINARY_*
- **Hardcoded:** `isTesting = true` in `src/config.js`; `PRODUCTION_URL` in apiClient
- **.env.example:** Only documents REACT_APP_IS_TESTING; no backend vars

---

## 8. Known Gaps

### Broken or will break in production

| Issue | Details |
|-------|---------|
| **Images 404** | Local uploads on Render are ephemeral; Cloudinary required |
| **CORS** | `CORS_ORIGINS` must include frontend URL (e.g. Vercel) |
| **isTesting hardcoded** | `config.js` has `isTesting = true`; production build may still call localhost |
| **Order creation failure silent** | Payment page catches error, logs to console, still navigates to confirmation; customer thinks order is placed |
| **Order ID mismatch** | Confirmation shows `RUVALI-{timestamp}`, not backend order ID; Track Order cannot work |
| **Track Order fake** | No API; form submits to nothing; generic message shown |

### Missing for a real store

| Gap | Details |
|-----|---------|
| **Payment gateway** | No Razorpay/Stripe; mock only |
| **Stock decrement** | Order creation does not reduce product stock |
| **Shipping in order total** | Backend stores product total only; frontend adds ₹100 |
| **Customer order history** | No customer auth; no “My Orders” |
| **Email notifications** | Only WhatsApp (Twilio); no email |
| **Pagination** | Products, categories, orders loaded in full |
| **Search** | No product search |
| **Admin password reset** | Not implemented |

### Security risks

| Risk | Details |
|------|---------|
| **Weak JWT secret** | Default `change-me` if ADMIN_JWT_SECRET not set |
| **No rate limiting** | Login/API can be brute-forced |
| **Token in localStorage** | XSS can steal admin token |
| **No customer auth** | Anyone can create orders; no verification |
| **Card data in state** | Mock card data in React state (not sent to backend) |

### Performance risks

| Risk | Details |
|------|---------|
| **No pagination** | Large product/order lists can be slow |
| **No caching** | Every request hits DB |
| **Single process** | No horizontal scaling |
| **WhatsApp inline** | Sends during request; can block response |

---

*End of report*
