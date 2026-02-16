# 🚀 Complete Backend Setup Guide

I'll help you set up everything step by step. Follow these instructions **in order**.

---

## ✅ Current Status

- ✅ Backend code is ready
- ✅ Backend dependencies installed (`npm install` done)
- ❌ MongoDB needs to be installed
- ❌ MongoDB needs to be started
- ❌ Admin user needs to be created
- ❌ Backend server needs to be started

---

## Step 1: Install MongoDB (Required)

**Option A: Automated Script (Easiest)**

Run this command in your terminal:

```bash
cd backend
./INSTALL_MONGODB.sh
```

**Option B: Manual Installation**

Run these commands one by one:

```bash
# 1. Add MongoDB repository
brew tap mongodb/brew

# 2. Install MongoDB (takes 5-10 minutes)
brew install mongodb-community

# 3. Start MongoDB service
brew services start mongodb-community

# 4. Verify it's working (should show version number)
mongosh --eval "db.version()"
```

**Expected Output:**
```
Current Mongosh Log ID: ...
MongoDB server version: 7.0.x
```

If you see a version number, MongoDB is installed and running! ✅

---

## Step 2: Create Admin User

Once MongoDB is running, create the admin user:

```bash
cd backend
node scripts/createAdmin.js admin admin@ruvali.com admin123 superadmin
```

**Expected Output:**
```
Admin created successfully!
Username: admin
Email: admin@ruvali.com
Role: superadmin
Password: admin123
```

---

## Step 3: Create Uploads Directory

```bash
cd backend
mkdir -p uploads
```

---

## Step 4: Start Backend Server

**Open a NEW terminal window** and run:

```bash
cd backend
npm run dev
```

**Expected Output:**
```
MongoDB connected
Server running on port 5000
```

**⚠️ IMPORTANT:** Keep this terminal window open! The backend must keep running.

---

## Step 5: Verify Backend is Working

Open your browser and visit:
```
http://localhost:5000/api/settings
```

**You should see:** JSON data (not an error page)

If you see JSON, the backend is working! ✅

---

## Step 6: Start Frontend

**Open ANOTHER terminal window** and run:

```bash
npm start
```

The frontend will start on `http://localhost:3000`

---

## Step 7: Test Admin Login

1. Go to: `http://localhost:3000/admin/login`
2. Login with:
   - **Username:** `admin`
   - **Password:** `admin123`

You should be able to login successfully! ✅

---

## 🎯 Quick Command Summary

Run these commands **in order**:

```bash
# Terminal 1: Install & Start MongoDB
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Terminal 1: Create admin & start backend
cd backend
node scripts/createAdmin.js admin admin@ruvali.com admin123 superadmin
mkdir -p uploads
npm run dev

# Terminal 2: Start frontend
npm start
```

---

## 📋 Terminal Windows You Need

You need **2 terminal windows**:

1. **Terminal 1:** Backend server (runs `npm run dev` - keep it open)
2. **Terminal 2:** Frontend React app (runs `npm start`)

MongoDB runs automatically in the background (via `brew services`).

---

## ❌ Troubleshooting

### "MongoDB connection refused"

**Solution:**
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# If not running, start it
brew services start mongodb-community

# Wait a few seconds, then verify
mongosh --eval "db.version()"
```

### "Port 5000 already in use"

**Solution:** Change port in `backend/.env`:
```env
PORT=5001
```

### "Failed to fetch" in frontend

**Solution:** Make sure backend is running:
1. Check Terminal 1 - should show "Server running on port 5000"
2. Visit http://localhost:5000/api/settings - should show JSON
3. If not, restart backend: `cd backend && npm run dev`

### Admin creation fails

**Solution:** Make sure MongoDB is running first:
```bash
mongosh --eval "db.version()"
```

If this fails, MongoDB isn't running. Start it:
```bash
brew services start mongodb-community
```

---

## ✅ Success Checklist

After setup, verify everything:

- [ ] MongoDB installed (`mongosh --version` works)
- [ ] MongoDB running (`mongosh --eval "db.version()"` shows version)
- [ ] Admin user created (no errors when running createAdmin script)
- [ ] Backend running (`http://localhost:5000/api/settings` shows JSON)
- [ ] Frontend running (`http://localhost:3000` loads)
- [ ] Admin login works (can login at `/admin/login`)

---

## 🎉 You're Done!

Once all checkboxes are checked:
- ✅ Backend API is running
- ✅ Admin panel is accessible
- ✅ You can manage products, orders, and settings

---

## Need Help?

If you get stuck at any step:

1. **Check the error message** - it usually tells you what's wrong
2. **Verify MongoDB is running:** `mongosh --eval "db.version()"`
3. **Check backend logs** - look at Terminal 1 for error messages
4. **Restart services:**
   ```bash
   brew services restart mongodb-community
   cd backend && npm run dev
   ```

---

**Ready to start?** Begin with Step 1 above! 🚀
