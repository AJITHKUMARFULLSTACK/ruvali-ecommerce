# Quick Start Guide - Backend Server

## The Error You're Seeing

"Failed to fetch" means the frontend can't connect to the backend API because the backend server isn't running.

## Step-by-Step Setup

### Option 1: Using Local MongoDB (Recommended for Development)

#### 1. Install MongoDB (if not installed)

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
Download and install from: https://www.mongodb.com/try/download/community

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

#### 2. Verify MongoDB is Running

```bash
# Check if MongoDB is running
mongosh --eval "db.version()"
```

If you see a version number, MongoDB is running!

#### 3. Create Admin User

```bash
cd backend
node scripts/createAdmin.js admin admin@ruvali.com admin123 superadmin
```

#### 4. Start Backend Server

Open a **NEW terminal window** and run:

```bash
cd backend
npm run dev
```

You should see:
```
MongoDB connected
Server running on port 5000
```

### Option 2: Using MongoDB Atlas (Cloud - No Local Installation)

#### 1. Create Free MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a free cluster
4. Get your connection string

#### 2. Update Backend .env File

Edit `backend/.env` and replace `MONGODB_URI` with your Atlas connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ruvali-ecommerce?retryWrites=true&w=majority
```

#### 3. Create Admin User

```bash
cd backend
node scripts/createAdmin.js admin admin@ruvali.com admin123 superadmin
```

#### 4. Start Backend Server

```bash
cd backend
npm run dev
```

## Verify Backend is Running

1. Open browser: http://localhost:5000/api/settings
2. You should see JSON data (not an error)

## Common Issues

### "MongoDB connection refused"
- **Solution:** Start MongoDB service
  - macOS: `brew services start mongodb-community`
  - Windows: Start MongoDB from Services
  - Linux: `sudo systemctl start mongodb`

### "Port 5000 already in use"
- **Solution:** Change port in `backend/.env`:
  ```env
  PORT=5001
  ```
  Then update frontend API calls to use port 5001

### "Cannot find module"
- **Solution:** Install dependencies:
  ```bash
  cd backend
  npm install
  ```

## Running Both Frontend and Backend

You need **TWO terminal windows**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm start
```

## Quick Commands Reference

```bash
# Start MongoDB (macOS)
brew services start mongodb-community

# Check MongoDB status
brew services list | grep mongodb

# Start Backend (in backend folder)
cd backend
npm run dev

# Create Admin User
cd backend
node scripts/createAdmin.js admin admin@ruvali.com admin123 superadmin

# Check if backend is running
curl http://localhost:5000/api/settings
```

## Success Indicators

✅ Backend is running when you see:
- "MongoDB connected" in terminal
- "Server running on port 5000"
- http://localhost:5000/api/settings returns JSON

✅ Frontend can connect when:
- No "Failed to fetch" errors
- Admin login works
- Products load from API
