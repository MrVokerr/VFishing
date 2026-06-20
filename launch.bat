@echo off
title VFishing
cd /d "%~dp0"

echo ========================================
echo   VFishing - Local Dev Launcher
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not on PATH.
    echo Install from https://nodejs.org/ then run this again.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo First run detected - installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed.
        pause
        exit /b 1
    )
    echo.
)

echo Starting dev server at http://localhost:3000
echo Browser will open once the server is ready.
echo Press Ctrl+C in this window to stop the server.
echo.

start /min "" "%~dp0open-browser.bat"

npm run dev

pause
