@echo off
setlocal
set "URL=http://localhost:3000"
set /a ATTEMPTS=0

:wait_loop
set /a ATTEMPTS+=1
if %ATTEMPTS% GTR 60 (
    echo Timed out waiting for VFishing server. Open %URL% manually.
    exit /b 1
)

powershell -NoProfile -Command ^
    "try { (Invoke-WebRequest -UseBasicParsing -Uri '%URL%' -TimeoutSec 2).StatusCode | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1

if errorlevel 1 (
    timeout /t 1 /nobreak >nul
    goto wait_loop
)

start "" "%URL%"
exit /b 0
