@echo off
echo ========================================
echo   Starting Team 5 E-commerce Platform
echo   Gajah Nusa Building Materials
echo ========================================
echo.
echo Frontend: http://localhost:3005
echo Backend API: http://localhost:8005/docs
echo.

cd /d "%~dp0"

REM Start Backend (FastAPI)
start "Team 5 - Backend API" cmd /k "cd backend && python main.py"

timeout /t 3 /nobreak > nul

REM Start Frontend (Next.js)
start "Team 5 - Frontend" cmd /k "npm run dev"

echo.
echo ✅ Team 5 E-commerce is starting...
echo.
echo Press any key to open browser...
pause > nul

start http://localhost:3005

echo.
echo ========================================
echo Services running:
echo - Frontend: http://localhost:3005
echo - Backend: http://localhost:8005
echo - API Docs: http://localhost:8005/docs
echo ========================================
