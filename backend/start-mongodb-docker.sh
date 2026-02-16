#!/bin/bash

echo "🐳 Starting MongoDB with Docker..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo ""
    echo "Please install Docker Desktop:"
    echo "https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running"
    echo ""
    echo "Please start Docker Desktop first"
    exit 1
fi

# Check if MongoDB container already exists
if docker ps -a | grep -q mongodb; then
    echo "📦 MongoDB container exists"
    
    # Check if it's running
    if docker ps | grep -q mongodb; then
        echo "✅ MongoDB is already running"
    else
        echo "🔄 Starting existing MongoDB container..."
        docker start mongodb
        sleep 2
        echo "✅ MongoDB started"
    fi
else
    echo "📥 Creating new MongoDB container..."
    docker run -d \
      --name mongodb \
      -p 27017:27017 \
      -v mongodb-data:/data/db \
      mongo:latest
    
    echo "✅ MongoDB container created and started"
    sleep 3
fi

# Verify MongoDB is running
if docker ps | grep -q mongodb; then
    echo ""
    echo "✅ MongoDB is running on port 27017"
    echo ""
    echo "Connection string: mongodb://localhost:27017/ruvali-ecommerce"
    echo ""
    echo "To stop MongoDB: docker stop mongodb"
    echo "To start MongoDB: docker start mongodb"
    echo "To view logs: docker logs mongodb"
else
    echo "❌ Failed to start MongoDB"
    exit 1
fi
