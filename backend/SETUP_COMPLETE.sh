#!/bin/bash

echo "🚀 RUVALI Backend Complete Setup"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check MongoDB
echo "📦 Step 1: Checking MongoDB installation..."
if command -v mongosh &> /dev/null; then
    echo -e "${GREEN}✅ MongoDB is installed${NC}"
    MONGODB_INSTALLED=true
else
    echo -e "${YELLOW}⚠️  MongoDB is not installed${NC}"
    MONGODB_INSTALLED=false
fi

# Step 2: Install MongoDB if needed
if [ "$MONGODB_INSTALLED" = false ]; then
    echo ""
    echo "📥 Installing MongoDB..."
    echo "This will take a few minutes..."
    
    # Add MongoDB tap
    brew tap mongodb/brew
    
    # Install MongoDB
    brew install mongodb-community
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ MongoDB installed successfully${NC}"
        MONGODB_INSTALLED=true
    else
        echo -e "${RED}❌ Failed to install MongoDB${NC}"
        echo "Please install manually: brew install mongodb-community"
        exit 1
    fi
fi

# Step 3: Start MongoDB
echo ""
echo "🔄 Step 2: Starting MongoDB service..."
brew services start mongodb-community

# Wait a bit for MongoDB to start
sleep 3

# Check if MongoDB is running
if mongosh --eval "db.version()" --quiet &> /dev/null; then
    echo -e "${GREEN}✅ MongoDB is running${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB might still be starting...${NC}"
    echo "Waiting 5 more seconds..."
    sleep 5
    
    if mongosh --eval "db.version()" --quiet &> /dev/null; then
        echo -e "${GREEN}✅ MongoDB is running${NC}"
    else
        echo -e "${RED}❌ MongoDB failed to start${NC}"
        echo "Try manually: brew services start mongodb-community"
        exit 1
    fi
fi

# Step 4: Check backend dependencies
echo ""
echo "📦 Step 3: Checking backend dependencies..."
cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencies installed${NC}"
    else
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Step 5: Create admin user
echo ""
echo "👤 Step 4: Creating admin user..."
node scripts/createAdmin.js admin admin@ruvali.com admin123 superadmin

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Admin user created${NC}"
    echo "   Username: admin"
    echo "   Password: admin123"
else
    echo -e "${YELLOW}⚠️  Admin user might already exist (this is okay)${NC}"
fi

# Step 6: Create uploads directory
echo ""
echo "📁 Step 5: Creating uploads directory..."
mkdir -p uploads
echo -e "${GREEN}✅ Uploads directory ready${NC}"

# Step 7: Verify .env file
echo ""
echo "⚙️  Step 6: Checking configuration..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
else
    echo -e "${YELLOW}⚠️  Creating .env file from .env.example${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
fi

# Final step
echo ""
echo "=================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "🚀 To start the backend server, run:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "📝 Admin Login Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "🌐 Backend will run on: http://localhost:5000"
echo ""
