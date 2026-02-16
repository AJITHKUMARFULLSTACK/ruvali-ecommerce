# Complete Backend Setup - Step by Step

Follow these steps **in order** to set up your backend completely.

## Step 1: Install MongoDB

Open your terminal and run:

```bash
# Add MongoDB repository
brew tap mongodb/brew

# Install MongoDB
brew install mongodb-community
```

**Wait for installation to complete** (this may take 5-10 minutes)

---

## Step 2: Start MongoDB Service

```bash
# Start MongoDB service
brew services start mongodb-community

# Verify it's running (should show version number)
mongosh --eval "db.version()"
```

If you see a version number (like `7.0.x`), MongoDB is running! ✅

---

## Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

Wait for all packages to install.

---

## Step 4: Create Admin User

```bash
# Make sure you're in the backend directory
cd backend

# Create admin user
node scripts/createAdmin.js admin admin@ruvali.com admin123 superadmin
```

You should see:
```
Admin created successfully!
Username: admin
Email: admin@ruvali.com
Role: superadmin
Password: admin123
```

---

## Step 5: Create Uploads Directory

```bash
# Still in backend directory
mkdir -p uploads
```

---

## Step 6: Verify .env File

Check if `backend/.env` exists. If not, create it:

```bash
cd backend
cp .env.example .env
```

Your `.env` should contain:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ruvali-ecommerce
JWT_SECRET=ruvali-super-secret-jwt-key-2024
NODE_ENV=development
```

---

## Step 7: Start Backend Server

**Open a NEW terminal window** (keep MongoDB running in background) and run:

```bash
cd backend
npm run dev
```

You should see:
```
MongoDB connected
Server running on port 5000
```

**Keep this terminal open!** The backend needs to keep running.

---

## Step 8: Verify Backend is Working

Open your browser and go to:
```
http://localhost:5000/api/settings
```

You should see JSON data (not an error page).

---

## Step 9: Start Frontend (Separate Terminal)

**Open ANOTHER terminal window** and run:

```bash
npm start
```

The frontend will start on `http://localhost:3000`

---

## Step 10: Test Admin Login

1. Go to: `http://localhost:3000/admin/login`
2. Login with:
   - **Username:** `admin`
   - **Password:** `admin123`

You should be able to login without "Failed to fetch" errors!

---

## Quick Setup Script (Alternative)

If you prefer, you can run the automated setup script:

```bash
cd backend
./SETUP_COMPLETE.sh
```

This will do steps 1-6 automatically!

---

## Troubleshooting

### MongoDB won't start
```bash
# Check status
brew services list | grep mongodb

# Restart if needed
brew services restart mongodb-community

# Check logs
tail -f /opt/homebrew/var/log/mongodb/mongo.log
```

### Port 5000 already in use
Edit `backend/.env` and change:
```env
PORT=5001
```

Then update frontend API calls (or restart the app using port 5001).

### "Cannot find module" errors
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Admin creation fails
Make sure MongoDB is running first:
```bash
mongosh --eval "db.version()"
```

---

## Success Checklist

- [ ] MongoDB installed
- [ ] MongoDB service running
- [ ] Backend dependencies installed
- [ ] Admin user created
- [ ] Backend server running on port 5000
- [ ] Can access http://localhost:5000/api/settings
- [ ] Frontend can connect (no "Failed to fetch")
- [ ] Admin login works

---

## You Need 3 Terminal Windows

1. **Terminal 1:** MongoDB (runs automatically via brew services)
2. **Terminal 2:** Backend server (`cd backend && npm run dev`)
3. **Terminal 3:** Frontend (`npm start`)

---

## Next Steps After Setup

1. ✅ Backend is running
2. ✅ Frontend is running  
3. ✅ Admin can login
4. 🎯 Start managing products, orders, and settings!

---

**Need help?** Check the error messages and refer to the troubleshooting section above.
