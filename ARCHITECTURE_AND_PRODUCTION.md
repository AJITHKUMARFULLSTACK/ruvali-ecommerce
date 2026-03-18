# SaaS Backend – Architecture & Production Readiness

## How the Backend Works

### 1. **Multi-tenant SaaS Model**

The backend supports **multiple stores** (tenants). Each store has:
- Its own products, categories, orders, customers
- Admin users who manage that store
- Store-specific branding (logo, colors, theme)

**Store identification:** Every public API call includes `storeSlug` (e.g. `ruvali-demo`) via query param or header. The backend resolves the store and returns only that store’s data.

---

## Data Storage

### Database: **PostgreSQL** (via Prisma ORM)

| Table | Purpose |
|-------|---------|
| **Store** | Store config (name, slug, logo, colors, theme) |
| **AdminUser** | Admin login (email, bcrypt-hashed password) |
| **Customer** | Customers per store (name, phone) |
| **Category** | Product categories (hierarchical: parent/children) |
| **Product** | Products (name, price, images, stock, category) |
| **Order** | Orders (customer, total, status, shipping info) |
| **OrderItem** | Line items (product, quantity, price) |
| **OrderStatusLog** | Status history + WhatsApp tracking |

### Image Storage: **Cloudinary** (production)

- Product images, category banners, store logo/background
- Local `/uploads` is only for development; Render’s disk is ephemeral
- **Production:** Cloudinary must be configured; local uploads are lost on restart

---

## Order Flow

1. **Checkout (frontend)** → User fills shipping, clicks Pay
2. **POST /api/orders** → Backend creates:
   - Customer (or finds existing by phone)
   - Order with status `PLACED`
   - OrderItems (product, quantity, price)
   - OrderStatusLog entry
3. **Transaction** → All of the above in a single DB transaction
4. **WhatsApp** → Optional status notification to customer (Twilio)
5. **Admin** → Admin can update status (PLACED → CONFIRMED → PACKED → SHIPPED → DELIVERED)

---

## Security

| Area | Current State |
|------|---------------|
| **Admin auth** | JWT (Bearer token), bcrypt for passwords |
| **Admin JWT secret** | From `ADMIN_JWT_SECRET` (must be strong in prod) |
| **Public APIs** | No auth – anyone can read products, create orders |
| **CORS** | Configurable via `CORS_ORIGINS` |
| **Helmet** | Security headers enabled |
| **SQL injection** | Mitigated by Prisma (parameterized queries) |

**Gaps:**
- No rate limiting
- No customer auth (guest checkout only)
- No payment gateway integration (mock/COD only)
- Admin password reset not implemented

---

## Scalability & Large Data

### Current Design

- **Single database** – One PostgreSQL instance
- **No caching** – Every request hits the DB
- **No pagination** – Products/categories/orders are loaded in full
- **No CDN** – Images served from Cloudinary (good)
- **No queue** – WhatsApp sends inline (can block response)

### Limits for High Volume

| Scenario | Risk |
|----------|------|
| **10,000+ products** | Slow product list; no pagination |
| **100,000+ orders** | Admin order list can be very slow |
| **Many concurrent users** | Single Node process; no horizontal scaling |
| **Heavy traffic** | No rate limiting; DB can be overloaded |

### What Would Help

1. **Pagination** – Products, orders, categories (e.g. limit 20–50 per page)
2. **Indexes** – Already on `storeId`, `categoryId`, etc.; add more if needed
3. **Caching** – Redis for store config, product lists
4. **Horizontal scaling** – Multiple Node instances behind a load balancer
5. **Background jobs** – Queue (Bull, etc.) for WhatsApp, emails
6. **Read replicas** – Separate DB for reads at scale

---

## Production Suitability

### ✅ Suitable for

- Small to medium stores (hundreds of products, thousands of orders)
- MVP / early launch
- Single-store or few-store deployments
- Low to moderate traffic

### ⚠️ Needs Work for Large Scale

- Pagination on all list endpoints
- Rate limiting (e.g. express-rate-limit)
- Proper payment integration (Razorpay, Stripe)
- Monitoring (logs, errors, performance)
- Backup strategy for PostgreSQL
- Stricter env validation (fail fast if required vars missing)

---

## Possible Production Issues

| Issue | Cause | Mitigation |
|------|-------|------------|
| **Images 404** | Local uploads on Render (ephemeral) | Use Cloudinary |
| **CORS errors** | Frontend origin not in `CORS_ORIGINS` | Add Vercel URL to Render env |
| **Slow admin** | Loading all orders/products | Add pagination |
| **Render spin-down** | Free tier sleeps after inactivity | Paid plan or cron ping |
| **DB connection limits** | Too many connections | Connection pooling (Prisma default) |
| **JWT secret weak** | Default or weak secret | Use strong random secret |
| **No backups** | DB crash = data loss | Enable Render Postgres backups |
| **WhatsApp failures** | Twilio limits / config | Log and retry; optional feature |

---

## Summary

The backend is a **multi-tenant SaaS** using PostgreSQL and Prisma. It handles stores, products, categories, orders, and customers with basic admin auth and optional WhatsApp notifications. It is suitable for **small–medium e-commerce** and MVPs. For high traffic and large catalogs, add pagination, caching, and scaling measures.
