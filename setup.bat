@echo off
echo Setting up CampBuddy Demo...

echo.
echo Installing Node.js dependencies...
call npm install

echo.
echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Creating environment file...
if not exist .env copy .env.example .env

echo.
echo Setup complete! 
echo.
echo IMPORTANT: Edit .env and add your Google API key
echo Then run start.bat to start the application
echo.
pause
