@echo off
TITLE VFishing Launcher
echo Starting VFishing Development Server...
echo The game will be available at http://localhost:3000

:: Start the browser after a 3 second delay to give the server time to initialize
start /b "" cmd /c "timeout /t 3 >nul && start http://localhost:3000"

:: Start the dev server
npm run dev

pause
