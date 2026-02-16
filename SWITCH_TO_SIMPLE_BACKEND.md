# Switch to Simple Backend - No MongoDB Needed!

## The Problem

You're running the **MongoDB backend** (`backend` folder) but MongoDB isn't installed/running, so you get:
```
MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017
```

## Solution: Use Simple Backend Instead!

I've created a **simpler backend** (`backend-simple` folder) that doesn't need MongoDB!

## Quick Switch (30 seconds)

### Step 1: Stop Current Backend

In your terminal, press `Ctrl+C` to stop the current backend.

### Step 2: Start Simple Backend

```bash
cd backend-simple
npm start
```

You should see:
```
🚀 Simple Backend Server running on port 5000
📁 Data stored in: /path/to/data
✅ No database setup needed!

🔑 Default Admin Login:
   Username: admin
   Password: admin123
```

**No MongoDB errors!** ✅

### Step 3: Test It

Open: http://localhost:5000/api/settings

Should show JSON data! ✅

## What's Different?

| MongoDB Backend | Simple Backend |
|----------------|----------------|
| Needs MongoDB | ✅ No database |
| Needs setup | ✅ Works immediately |
| Connection errors | ✅ No errors |
| Complex | ✅ Simple |

## Your Frontend Works the Same!

The API is identical, so:
- ✅ Same endpoints
- ✅ Same admin login
- ✅ Same functionality
- ✅ No frontend changes needed

## Data Storage

Simple backend stores everything in files:
- `backend-simple/data/products.json` - Products
- `backend-simple/data/orders.json` - Orders
- `backend-simple/data/settings.json` - Settings

**Everything persists** - just in files instead of a database!

## Default Admin

- **Username:** `admin`
- **Password:** `admin123`

(Already created automatically!)

---

## Quick Commands

**Stop MongoDB backend:**
```bash
# Press Ctrl+C in the terminal running backend
```

**Start Simple backend:**
```bash
cd backend-simple
npm start
```

**Start Frontend (another terminal):**
```bash
npm start
```

---

## That's It!

Much simpler - no MongoDB setup needed! 🎉
