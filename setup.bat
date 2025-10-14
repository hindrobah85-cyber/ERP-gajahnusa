@echo off
REM GAJAH NUSA ERP - Automated Setup Script
REM ==========================================

echo.
echo ========================================
echo  GAJAH NUSA ERP - SETUP INSTALLER
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.13+ first
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js LTS first
    pause
    exit /b 1
)

echo [INFO] Setting up Python virtual environment...
if not exist .venv (
    python -m venv .venv
    echo [SUCCESS] Virtual environment created
) else (
    echo [INFO] Virtual environment already exists
)

echo.
echo [INFO] Activating virtual environment...
call .venv\Scripts\activate.bat

echo.
echo [INFO] Installing Python dependencies...
.venv\Scripts\python.exe -m pip install --upgrade pip
.venv\Scripts\python.exe -m pip install -r requirements.txt

if errorlevel 1 (
    echo [ERROR] Failed to install Python dependencies
    pause
    exit /b 1
)

echo.
echo [INFO] Setting up Frontend dependencies...
cd frontend
call npm install

if errorlevel 1 (
    echo [ERROR] Failed to install Frontend dependencies
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo [INFO] Creating necessary directories...
if not exist models mkdir models
if not exist logs mkdir logs
if not exist uploads mkdir uploads

echo.
echo [INFO] Setting up database...
.venv\Scripts\python.exe -c "from backend.app.models.database import create_tables; create_tables(); print('Database initialized successfully')"

echo.
echo ========================================
echo  SETUP COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo To start the system:
echo 1. Backend:  start_backend.bat
echo 2. Frontend: start_frontend.bat
echo 3. Full:     start_all.bat
echo.
echo Documentation: ENVIRONMENT.md
echo.
pause
