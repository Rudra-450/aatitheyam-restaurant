@echo off
title Aatitheyam Cafe & Bhojnalaya - Digital Menu Platform
echo ====================================================================
echo   Starting Aatitheyam Cafe & Bhojnalaya - Digital Menu Platform
echo ====================================================================
echo.
cd /d "%~dp0backend"

echo [*] Launching application on http://localhost:8000 ...
echo [*] Press Ctrl+C in this window anytime to stop the server.
echo.

:: Automatically open browser after 2 seconds in background
start "" cmd /c "timeout /t 2 /nobreak > nul && start http://localhost:8000/menu"

:: Start unified server (serves both React Frontend and FastAPI Backend)
if exist "venv\Scripts\python.exe" (
    venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
) else (
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
)

echo.
echo Server stopped.
pause
