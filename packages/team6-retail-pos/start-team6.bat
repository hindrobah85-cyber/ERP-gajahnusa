@echo off
echo ============================================
echo  Gajah Nusa Retail POS System - Team 6
echo  Starting Frontend and Backend...
echo ============================================
echo.

REM Check if running from correct directory
if not exist "packages\team6-retail-pos" (
    echo ERROR: Please run this script from the Project_ERP root directory
    pause
    exit /b 1
)

echo [1/4] Checking backend dependencies...
cd packages\team6-retail-pos\backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
) else (
    echo Backend dependencies OK
)

echo.
echo [2/4] Checking frontend dependencies...
cd ..\
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
) else (
    echo Frontend dependencies OK
)

echo.
echo [3/4] Starting Backend API (Port 8006)...
cd backend
start "Team 6 Backend - Port 8006" cmd /k "npm start"

timeout /t 3 /nobreak >nul

echo.
echo [4/4] Starting Frontend (Port 3006)...
cd ..\
start "Team 6 Frontend - Port 3006" cmd /k "npm run dev"

echo.
echo ============================================
echo  Team 6 Retail POS Started Successfully!
echo ============================================
echo  Frontend: http://localhost:3006
echo  Backend:  http://localhost:8006
echo  API Docs: http://localhost:8006/health
echo ============================================
echo.
echo Press any key to open browser...
pause >nul

timeout /t 2 /nobreak >nul
start http://localhost:3006

echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
