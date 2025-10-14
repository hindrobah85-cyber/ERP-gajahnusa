@echo off
REM Start All Services
echo Starting GAJAH NUSA ERP - All Services...
echo.

REM Start Backend in new window
start "GAJAH NUSA - Backend" cmd /k "cd /d %~dp0 && call start_backend.bat"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend in new window  
start "GAJAH NUSA - Frontend" cmd /k "cd /d %~dp0 && call start_frontend.bat"

echo.
echo ========================================
echo  GAJAH NUSA ERP STARTED!
echo ========================================
echo.
echo Backend:  http://localhost:8001
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8001/docs
echo.
echo Press any key to open browser...
pause >nul

REM Open browser
start http://localhost:5173
