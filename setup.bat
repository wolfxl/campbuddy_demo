@echo off

echo 🏕️ CampBuddy Integration Setup Script
echo ======================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

echo ✅ Python detected

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found. Creating from template...
    copy .env.example .env
    echo 📝 Please edit .env file and add your GOOGLE_API_KEY
    echo    You can get it from: https://makersuite.google.com/app/apikey
    pause
)

REM Install Python dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

REM Check if Node.js is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js/npm is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js detected

REM Install Node.js dependencies (if not already installed)
if not exist "node_modules" (
    echo 📦 Installing Node.js dependencies...
    npm install
)

echo.
echo 🎉 Setup complete!
echo.
echo 🚀 To start the application:
echo    1. Start Python backend:  python api_server.py
echo    2. Start Next.js frontend: npm run dev
echo    3. Open http://localhost:3000/chat
echo.
echo 🔧 Backend API will run on: http://localhost:5000
echo 🌐 Frontend will run on: http://localhost:3000
echo.
pause
