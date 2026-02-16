# 🚀 Quick Start - Get Backend Running

## The Problem
You're seeing "Failed to fetch" because the backend server isn't running.

## Quick Solution (Choose One)

### ✅ Option A: Install MongoDB Locally (5 minutes)

**1. Install MongoDB on macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**2. Verify it's running:**
```bash
mongosh --eval "db.version()"
```
(Should show a version number)

**3. Create admin user:**
```bash
cd backend
node scripts/createAdmin.js admin admin@ruvali.com admin123 superadmin
```

**4. Start backend (in a NEW terminal):**
```bash
cd backend
npm run dev
```

**5. Keep it running!** Leave that terminal open.

**6. Start frontend (in another terminal):**
```bash
npm start
```

---

### ✅ Option B: Use MongoDB Atlas (Cloud - No Installation)

**1. Go to:** https://www.mongodb.com/cloud/atlas/register

**2. Create free account and cluster**

**3. Get connection string** (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/`)

**4. Update `backend/.env`:**
```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/ruvali-ecommerce?retryWrites=true&w=majority
```

**5. Create admin:**
```bash
cd backend
node scripts/createAdmin.js admin admin@ruvali.com admin123 superadmin
```

**6. Start backend:**
```bash
cd backend
npm run dev
```

---

## ✅ Verify It's Working

**Check backend:**
- Open: http://localhost:5000/api/settings
- Should see JSON (not error)

**Check frontend:**
- Go to: http://localhost:3000/admin/login
- Login: `admin` / `admin123`
- Should work without "Failed to fetch" error

---

## 📋 You Need TWO Terminal Windows

**Terminal 1 - Backend (keep running):**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm start
```

---

## ❌ Common Errors

**"MongoDB connection refused"**
→ MongoDB not running. Start it with `brew services start mongodb-community`

**"Failed to fetch"**
→ Backend not running. Start it with `cd backend && npm run dev`

**"Port 5000 already in use"**
→ Change port in `backend/.env` to `PORT=5001`

---

## 🎯 Success Checklist

- [ ] MongoDB is running (or Atlas configured)
- [ ] Admin user created
- [ ] Backend server running on port 5000
- [ ] Frontend can access http://localhost:5000/api/settings
- [ ] No "Failed to fetch" errors

---

**Need help?** Check `BACKEND_START_GUIDE.md` for detailed instructions.
