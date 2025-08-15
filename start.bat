@echo off
echo 🏕️ Starting CampBuddy Services...
echo ================================

REM Start Python backend in a new window
echo 🔧 Starting Python backend on port 5000...
start "CampBuddy Backend" cmd /k "python api_server.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start Next.js frontend
echo 🌐 Starting Next.js frontend on port 3000...
echo 📝 Frontend will open automatically in your browser
npm run dev

pause
