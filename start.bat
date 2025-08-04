@echo off
echo Starting CampBuddy Demo...

echo.
echo Starting Python backend...
start /B python api_server.py

echo.
echo Waiting for backend to start...
timeout /t 3

echo.
echo Starting Next.js frontend...
npm run dev

pause
