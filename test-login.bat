@echo off
echo Testing Sales Mobile Login Functionality...
echo.
echo Opening test file in browser...
start chrome "file:///C:/Project_ERP/test-login.html"
echo.
echo Opening main application...
start chrome "file:///C:/Project_ERP/sales-mobile-final.html"
echo.
echo Both files opened. Please test the login functionality:
echo 1. Use Employee ID: EMP001
echo 2. Use Password: password123
echo 3. Click Login button or press Enter
echo.
echo Check browser console for debug messages.
pause
