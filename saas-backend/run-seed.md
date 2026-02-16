# Run Seed (Create Admin User)

The seed creates a demo store and admin user in your database.

## Step 1: Get your DATABASE_URL from Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Open your **Postgres** database
3. Go to **Connect** or **Info**
4. Copy the **External Database URL** (use Internal if backend is on Render in same region)

It looks like:
```
postgresql://ruvali_db_user:PASSWORD@dpg-xxxxx.oregon-postgres.render.com/ruvali_db?sslmode=require
```

## Step 2: Run the seed

Open Terminal and run (replace with YOUR actual URL):

```bash
cd saas-backend
DATABASE_URL="postgresql://ruvali_db_user:YOUR_PASSWORD@dpg-d69i95fpm1nc739hrf00-a.oregon-postgres.render.com/ruvali_db?sslmode=require" npm run seed
```

## Step 3: Login credentials

After seed runs successfully:

- **Email:** admin@ruvali-demo.com
- **Password:** admin123
