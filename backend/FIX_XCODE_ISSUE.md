# Fixing Xcode Version Issue

## The Problem

You're seeing this error:
```
Error: Your Xcode (16.4) at /Applications/Xcode.app is too outdated.
Please update to Xcode 26.0 (or delete it).
```

This is a compatibility check issue. Xcode 26.0 doesn't actually exist - this seems to be a version mismatch.

## Solution 1: Install MongoDB Using Pre-built Binaries (Recommended)

Instead of building from source, we can install MongoDB using pre-built binaries:

```bash
# Download MongoDB directly (no build required)
curl -O https://fastdl.mongodb.org/osx/mongodb-macos-arm64-8.0.0.tgz

# Extract
tar -zxvf mongodb-macos-arm64-8.0.0.tgz

# Move to /usr/local
sudo mv mongodb-macos-arm64-8.0.0 /usr/local/mongodb

# Add to PATH (add this to your ~/.zshrc)
echo 'export PATH=/usr/local/mongodb/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# Create data directory
sudo mkdir -p /data/db
sudo chown -R $(whoami) /data/db

# Start MongoDB
/usr/local/mongodb/bin/mongod --dbpath /data/db
```

## Solution 2: Use MongoDB Atlas (Cloud - Easiest!)

Skip local installation entirely and use MongoDB Atlas (free cloud database):

### Steps:

1. **Sign up for free:** https://www.mongodb.com/cloud/atlas/register

2. **Create a free cluster** (takes 2 minutes)

3. **Get your connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`)

4. **Update backend/.env:**
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/ruvali-ecommerce?retryWrites=true&w=majority
   ```

5. **That's it!** No local MongoDB needed.

## Solution 3: Fix Xcode Issue (If you want local MongoDB)

Try updating Xcode command line tools:

```bash
# Update command line tools
sudo xcode-select --install

# Or try removing and reinstalling
sudo rm -rf /Library/Developer/CommandLineTools
xcode-select --install
```

Then try installing MongoDB again:
```bash
brew install mongodb-community
```

## Solution 4: Use Docker (Alternative)

If you have Docker installed:

```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# MongoDB will be available at localhost:27017
```

Then update your `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/ruvali-ecommerce
```

---

## My Recommendation

**Use Solution 2 (MongoDB Atlas)** - It's the easiest and you don't need to deal with local installation issues. Plus it's free and works perfectly for development!
