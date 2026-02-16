# Simple Backend - No Database Required! 🎉

This is a **much simpler** backend that uses JSON files instead of MongoDB. No database setup needed!

## Why This is Simpler

- ✅ **No MongoDB** - Uses JSON files for storage
- ✅ **No installation** - Just `npm install` and run
- ✅ **No configuration** - Works out of the box
- ✅ **Same API** - Compatible with your frontend
- ✅ **File-based** - All data stored in `data/` folder

## Quick Start (2 Minutes!)

### Step 1: Install Dependencies

```bash
cd backend-simple
npm install
```

### Step 2: Start Server

```bash
npm start
```

That's it! 🎉

You should see:
```
🚀 Simple Backend Server running on port 5000
📁 Data stored in: /path/to/data
✅ No database setup needed!

🔑 Default Admin Login:
   Username: admin
   Password: admin123
```

### Step 3: Test It

Open browser: http://localhost:5000/api/settings

You should see JSON data! ✅

## Default Admin

- **Username:** `admin`
- **Password:** `admin123`

## How It Works

- **Products:** Stored in `data/products.json`
- **Orders:** Stored in `data/orders.json`
- **Settings:** Stored in `data/settings.json`
- **Admins:** Stored in `data/admins.json`
- **Images:** Stored in `uploads/` folder

All data persists in files - no database needed!

## API Endpoints

Same as the MongoDB version:

- `POST /api/admin/login` - Admin login
- `GET /api/products` - Get products
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `POST /api/orders` - Create order
- `GET /api/orders` - Get orders (admin)
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings (admin)
- `POST /api/upload/image` - Upload image (admin)

## Frontend Setup

Your frontend will work exactly the same! Just make sure it's pointing to:
```
http://localhost:5000
```

## Data Files

All data is stored in the `data/` folder:
- `products.json` - All products
- `orders.json` - All orders
- `settings.json` - Theme and settings
- `admins.json` - Admin users

You can edit these files directly if needed (but use the API for safety).

## Advantages

✅ **No MongoDB** - No installation or setup
✅ **No Docker** - No containers needed
✅ **No Cloud** - Everything local
✅ **Simple** - Just files
✅ **Fast Setup** - 2 minutes to start

## Disadvantages

⚠️ **Not for production** - Use MongoDB for real apps
⚠️ **Single server** - Can't scale horizontally
⚠️ **File locking** - Not ideal for high concurrency

But perfect for **development and learning**! 🎯

## Migration to MongoDB Later

If you want to switch to MongoDB later, the API is the same, so your frontend won't need changes!

## Troubleshooting

### Port 5000 already in use
Change port in `server.js`:
```javascript
const PORT = 5001; // or any other port
```

### Can't write to data folder
Make sure you have write permissions:
```bash
chmod -R 755 backend-simple/data
```

### Admin login not working
Default admin is created automatically. If it doesn't work, check `data/admins.json` exists.

---

**That's it!** Much simpler, right? 😊
