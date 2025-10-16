@echo off
echo ============================================
echo  Gajah Nusa Customer Service CRM - Team 7
echo  Starting Frontend and Backend...
echo ============================================
echo.

REM Check if running from correct directory
if not exist "packages\team7-customer-service" (
    echo ERROR: Please run this script from the Project_ERP root directory
    pause
    exit /b 1
)

echo [1/4] Checking frontend dependencies...
cd packages\team7-customer-service
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
) else (
    echo Frontend dependencies OK
)

echo.
echo [2/4] Checking Go backend...
cd backend
if not exist "go.mod" (
    echo Initializing Go module...
    go mod init team7-backend
)

echo.
echo [3/4] Starting Backend API (Port 8007)...
start "Team 7 Backend - Port 8007" cmd /k "go run main.go"

timeout /t 3 /nobreak >nul

echo.
echo [4/4] Starting Frontend (Port 3007)...
cd ..\
start "Team 7 Frontend - Port 3007" cmd /k "npm run dev"

echo.
echo ============================================
echo  Team 7 Customer Service CRM Started!
echo ============================================
echo  Frontend: http://localhost:3007
echo  Backend:  http://localhost:8007
echo  API Docs: http://localhost:8007/health
echo ============================================
echo.
echo Press any key to open browser...
pause >nul

timeout /t 2 /nobreak >nul
start http://localhost:3007

echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
