@echo off
echo ============================================
echo  SAFE COPY TO USB DRIVE E:\
echo  Project_ERP Migration Script
echo ============================================
echo.

REM Check if E:\ exists
if not exist E:\ (
    echo ERROR: USB Drive E:\ not found!
    echo Please insert USB drive and assign it as E:\ drive
    pause
    exit /b 1
)

echo Target: E:\Project_ERP
echo Source: D:\Project_ERP
echo.
echo This will copy all necessary files EXCEPT:
echo  - node_modules/
echo  - __pycache__/
echo  - venv/
echo  - .next/
echo  - dist/
echo  - build/
echo.
echo These folders will be regenerated after migration.
echo.
pause

echo.
echo [COPYING TO USB...]
echo.

REM Create target directory
if not exist E:\Project_ERP (
    echo Creating E:\Project_ERP...
    mkdir E:\Project_ERP
)

REM Use robocopy for safe copying with exclusions
echo Starting robocopy...
echo.

robocopy D:\Project_ERP E:\Project_ERP /E /Z /R:3 /W:5 /MT:4 ^
    /XD node_modules __pycache__ venv .next dist build .vite ^
    /XF *.log *.tmp ^
    /NP /NDL /NFL

if %ERRORLEVEL% GEQ 8 (
    echo.
    echo ERROR: Copy failed with error level %ERRORLEVEL%
    pause
    exit /b 1
)

echo.
echo ============================================
echo  COPY COMPLETE!
echo ============================================
echo.
echo Files copied to: E:\Project_ERP
echo.
echo NEXT STEPS:
echo 1. Navigate to E:\Project_ERP
echo 2. Run setup-after-migration.bat
echo 3. Test with start-all-teams.bat
echo.
echo Verifying copy...
echo.

REM Verify critical files
if exist E:\Project_ERP\start-all-teams.bat (
    echo [OK] start-all-teams.bat
) else (
    echo [MISSING] start-all-teams.bat
)

if exist E:\Project_ERP\packages (
    echo [OK] packages folder
) else (
    echo [MISSING] packages folder
)

if exist E:\Project_ERP\.git (
    echo [OK] .git repository
) else (
    echo [MISSING] .git repository
)

if exist E:\Project_ERP\README_COMPLETE.md (
    echo [OK] README_COMPLETE.md
) else (
    echo [MISSING] README_COMPLETE.md
)

echo.
echo Migration to USB completed successfully!
echo.
pause
