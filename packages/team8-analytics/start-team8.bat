@echo off
echo ============================================
echo  Gajah Nusa Analytics ^& BI - Team 8
echo  Starting Frontend and Backend...
echo ============================================
echo.

REM Check if running from correct directory
if not exist "packages\team8-analytics" (
    echo ERROR: Please run this script from the Project_ERP root directory
    pause
    exit /b 1
)

echo [1/4] Checking frontend dependencies...
cd packages\team8-analytics
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
) else (
    echo Frontend dependencies OK
)

echo.
echo [2/4] Checking Python backend...
cd backend
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment and installing dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo.
echo [3/4] Starting Backend API (Port 8008)...
start "Team 8 Backend - Port 8008" cmd /k "cd /d %CD% && venv\Scripts\activate.bat && python main.py"

timeout /t 3 /nobreak >nul

echo.
echo [4/4] Starting Frontend (Port 3008)...
cd ..\
start "Team 8 Frontend - Port 3008" cmd /k "npm run dev"

echo.
echo ============================================
echo  Team 8 Analytics ^& BI Started!
echo ============================================
echo  Frontend: http://localhost:3008
echo  Backend:  http://localhost:8008
echo  API Docs: http://localhost:8008/docs
echo ============================================
echo.
echo Press any key to open browser...
pause >nul

timeout /t 2 /nobreak >nul
start http://localhost:3008

echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
