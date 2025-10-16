@echo off
echo ============================================
echo  Push ERP Gajah Nusa ke GitHub
echo ============================================
echo.

cd D:\Project_ERP

echo [1/3] Checking git status...
git status

echo.
echo [2/3] Setting remote URL...
git remote set-url origin https://github.com/hindro150/ERP_gajahnusa.git

echo.
echo [3/3] Pushing to GitHub...
git push -u origin main

echo.
echo ============================================
echo  Push Complete!
echo ============================================
echo  Repository: https://github.com/hindro150/ERP_gajahnusa
echo ============================================
echo.
pause
