@echo off
title Aatitheyam Cafe & Bhojnalaya Launcher
echo ====================================================================
echo   Launching Aatitheyam Cafe & Bhojnalaya - Digital Menu Platform
echo ====================================================================
echo.
echo [*] Starting Backend API Server (Port 8000)...
start "Aatitheyam Backend API" "%~dp0start-backend.bat"

echo [*] Starting Frontend Web Server (Port 5173)...
start "Aatitheyam Frontend" "%~dp0start-frontend.bat"

echo [*] Waiting for services to initialize...
timeout /t 4 /nobreak > nul

echo [*] Opening Customer Digital Menu in your browser...
start http://localhost:5173/menu

echo.
echo ====================================================================
echo   The system is now running!
echo   Customer Menu:    http://localhost:5173/menu
echo   Owner Dashboard:  http://localhost:5173/admin
echo ====================================================================
