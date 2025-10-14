@echo off
echo ================================
echo GAJAH NUSA ERP - Chrome Demo
echo ================================
echo.
echo Opening Chrome with all demo pages...
echo.

start chrome "http://localhost:8083/register.html"
timeout /t 2 /nobreak >nul
start chrome "http://localhost:8083/employee_management.html"
timeout /t 2 /nobreak >nul
start chrome "http://localhost:8083/web_admin_dashboard.html"
timeout /t 2 /nobreak >nul
start chrome "http://localhost:8083/chrome_demo_guide.html"

echo.
echo ✅ Chrome tabs opened!
echo.
echo 📋 Available URLs:
echo   - Registration: http://localhost:8083/register.html
echo   - Employee Mgmt: http://localhost:8083/employee_management.html
echo   - Admin Dashboard: http://localhost:8083/web_admin_dashboard.html
echo   - Demo Guide: http://localhost:8083/chrome_demo_guide.html
echo   - API Docs: http://localhost:8002/docs
echo.
echo 🚀 Servers Status:
echo   - HTTP Server: Running on port 8083
echo   - API Server: Running on port 8002
echo.
pause
