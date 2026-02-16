#!/bin/bash

echo "🔧 Installing MongoDB..."
echo ""

# Add MongoDB tap
echo "Step 1: Adding MongoDB repository..."
brew tap mongodb/brew

# Install MongoDB
echo "Step 2: Installing MongoDB Community Edition..."
echo "This may take 5-10 minutes..."
brew install mongodb-community

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ MongoDB installed successfully!"
    echo ""
    echo "Starting MongoDB service..."
    brew services start mongodb-community
    
    echo ""
    echo "Waiting for MongoDB to start..."
    sleep 5
    
    # Verify
    if mongosh --eval "db.version()" --quiet &> /dev/null; then
        echo "✅ MongoDB is running!"
        echo ""
        echo "Next steps:"
        echo "1. Run: cd backend && node scripts/createAdmin.js admin admin@ruvali.com admin123 superadmin"
        echo "2. Run: cd backend && npm run dev"
    else
        echo "⚠️  MongoDB installed but not responding yet."
        echo "Try: brew services restart mongodb-community"
    fi
else
    echo "❌ Installation failed. Please install manually."
fi
