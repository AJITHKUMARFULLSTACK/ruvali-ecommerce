# Deployment (current stack)

Ruvali no longer ships the Postgres/Prisma/Render **`saas-backend`** in this repo. Production uses **`ruvali-backend/`** (MySQL + Express), aligned with **`https://github.com/AJITHKUMARFULLSTACK/ruvali_backend.git`**.

## Frontend (this repo root)

1. **`npm install`** and **`npm run build`**
2. Host the **`build/`** directory on Hostinger Static, Vercel, or similar.
3. Set **`REACT_APP_API_URL`** to your HTTPS API origin (see **`.env.example`**).
4. Set **`REACT_APP_STORE_SLUG`** (for example **`ruvali`**).

## Backend

1. Deploy from **`ruvali_backend`** (separate repo) or the **`ruvali-backend/`** copy in this monorepo — keep deployments in sync with what Hostinger pulls.
2. Configure **MySQL**, **JWT**, **CORS**, **`PUBLIC_BASE_URL`** (full image URLs in JSON), and static **`/uploads`** — see **`ruvali-backend/.env.example`**.
3. Health check: **`GET /api/health`**
