@echo off
echo ============================================
echo  PUSH TO GITHUB - Step by Step
echo ============================================
echo.
echo Pastikan sudah:
echo 1. Buat repository di GitHub (https://github.com/new)
echo 2. Repository name: ERP_gajahnusa
echo 3. JANGAN initialize dengan README/gitignore
echo.
echo Tekan ENTER untuk melanjutkan...
pause >nul

cd D:\Project_ERP

echo.
echo [1/6] Git status...
git status

echo.
echo [2/6] Remove old remote...
git remote remove origin 2>nul

echo.
echo [3/6] Add new remote...
git remote add origin https://github.com/hindro150/ERP_gajahnusa.git

echo.
echo [4/6] Check remote...
git remote -v

echo.
echo [5/6] Branch setup...
git branch -M main

echo.
echo ============================================
echo  READY TO PUSH!
echo ============================================
echo.
echo Jika minta username/password:
echo - Username: hindro150
echo - Password: GUNAKAN PERSONAL ACCESS TOKEN (bukan password biasa)
echo.
echo Buat token di: https://github.com/settings/tokens
echo - Click: Generate new token (classic)
echo - Select: repo (full control)
echo - Copy token dan paste sebagai password
echo.
echo Tekan ENTER untuk push...
pause >nul

echo.
echo [6/6] Pushing to GitHub...
git push -u origin main

echo.
echo ============================================
echo  CHECK HASIL
echo ============================================
echo.
echo Jika berhasil, buka:
echo https://github.com/hindro150/ERP_gajahnusa
echo.
echo Jika error "Repository not found":
echo - Pastikan repository sudah dibuat
echo - Pastikan nama repository exact: ERP_gajahnusa
echo - Cek: https://github.com/hindro150?tab=repositories
echo.
echo Jika error "Authentication failed":
echo - Gunakan Personal Access Token sebagai password
echo - BUKAN password GitHub biasa
echo - Token bisa dibuat di: https://github.com/settings/tokens
echo.
pause
