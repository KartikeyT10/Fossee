@echo off
cd desktop-frontend
echo Installing dependencies...
venv\Scripts\python.exe -m pip install pandas requests
if %errorlevel% neq 0 (
    echo Failed to install dependencies!
    pause
    exit /b %errorlevel%
)
echo Starting Application...
venv\Scripts\python.exe main.py
pause
