#!/bin/bash
echo "🚀 Starting RUVALI Backend Server..."
echo ""
echo "Step 1: Checking MongoDB..."

# Check if MongoDB is running
if mongosh --eval "db.version()" > /dev/null 2>&1; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB is not running"
    echo ""
    echo "Please start MongoDB first:"
    echo "  macOS: brew services start mongodb-community"
    echo "  Or install: brew install mongodb-community"
    echo ""
    echo "Or use MongoDB Atlas (cloud) - see BACKEND_START_GUIDE.md"
    exit 1
fi

echo ""
echo "Step 2: Starting backend server..."
cd backend
npm run dev
