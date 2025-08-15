#!/bin/bash

echo "🏕️ CampBuddy Integration Setup Script"
echo "======================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Python 3 detected"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file and add your GOOGLE_API_KEY"
    echo "   You can get it from: https://makersuite.google.com/app/apikey"
    read -p "Press Enter when you've added your API key..."
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Check if Node.js is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Node.js/npm is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js detected"

# Install Node.js dependencies (if not already installed)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   1. Start Python backend:  python3 api_server.py"
echo "   2. Start Next.js frontend: npm run dev"
echo "   3. Open http://localhost:3000/chat"
echo ""
echo "🔧 Backend API will run on: http://localhost:5000"
echo "🌐 Frontend will run on: http://localhost:3000"
