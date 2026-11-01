@echo off
title Aatitheyam - Backend API Server
echo ============================================================
echo   Starting Aatitheyam Cafe & Bhojnalaya - Backend API
echo ============================================================
cd /d "%~dp0backend"

if exist "venv\Scripts\python.exe" (
    echo [*] Using project virtual environment (venv)...
    venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
) else (
    echo [*] Using system Python...
    python -m uvicorn app.main:app --reload --port 8000
)
pause
