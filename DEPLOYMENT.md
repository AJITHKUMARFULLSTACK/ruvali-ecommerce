# Deployment Guide

## Overview

- **Frontend**: Vercel (React)
- **Backend**: Render (Node.js + Express + Prisma)

## 1. Deploy Backend (Render)

1. Connect your repo to Render and create a **Web Service**
2. Set **Root Directory** to `saas-backend`
3. Build: `npm install && npx prisma generate`
4. Start: `npm start` or `node src/server.js` (check `package.json` scripts)

### Required Environment Variables (Render)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (from Render Postgres) |
| `ADMIN_JWT_SECRET` | Secret for admin auth (generate a random string) |
| `CORS_ORIGINS` | **Critical** – Comma-separated allowed origins |
| `CLOUDINARY_CLOUD_NAME` | For image uploads (required in production) |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### CORS_ORIGINS (required for deployed frontend)

Set on Render:

```
CORS_ORIGINS=https://ruvali-ecommerce.vercel.app,https://your-custom-domain.com,http://localhost:3000
```

Replace `ruvali-ecommerce.vercel.app` with your actual Vercel URL. Include all origins that will call your API.

---

## 2. Deploy Frontend (Vercel)

1. Connect your repo to Vercel
2. Set **Root Directory** to project root (or leave empty)
3. Build: `npm run build`

### Optional Environment Variables (Vercel)

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Override API URL (default: `https://ruvali-ecommerce-1.onrender.com`) |

Usually you don't need to set anything – the build uses the production backend URL automatically.

---

## 3. Troubleshooting

### "Works locally, not when deployed"

**Cause**: CORS or wrong API URL.

**Fix**:
1. On **Render**, set `CORS_ORIGINS` to include your Vercel URL (e.g. `https://ruvali-ecommerce.vercel.app`)
2. Redeploy the backend after changing env vars
3. Ensure no `REACT_APP_IS_TESTING=true` in Vercel (production always uses production API)

### Images not loading / Upload gives "Internal Error"

**Cause**: Cloudinary is not configured on Render. The backend needs Cloudinary for image uploads (local storage does not persist on Render).

**Fix**:
1. Create a free [Cloudinary](https://cloudinary.com) account
2. In Render → your backend service → **Environment**, add:
   - `CLOUDINARY_CLOUD_NAME` (from Cloudinary dashboard)
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Redeploy the backend
4. Re-upload any product/category/store images via the admin panel (old local uploads are lost)

### CORS / ERR_BLOCKED_BY_RESPONSE

**Cause**: Backend security headers block cross-origin requests.

**Fix**: The backend uses `crossOriginResourcePolicy: 'cross-origin'` for images. Ensure `CORS_ORIGINS` includes your frontend URL.
