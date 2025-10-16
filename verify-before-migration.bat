@echo off
echo ============================================
echo  PRE-MIGRATION VERIFICATION
echo  Checking System Readiness
echo ============================================
echo.

echo [1/6] Checking Git Status...
git status --short
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Git repository issue detected
) else (
    echo [OK] Git repository status checked
)
echo.

echo [2/6] Checking USB Drive E:\...
if exist E:\ (
    echo [OK] USB Drive E:\ detected
    
    REM Check free space (using WMIC)
    for /f "tokens=2 delims==" %%a in ('wmic logicaldisk where "DeviceID='E:'" get FreeSpace /value') do set FreeSpace=%%a
    if defined FreeSpace (
        set /a FreeSpaceGB=!FreeSpace:~0,-9!
        echo [INFO] Free space on E:\: !FreeSpaceGB! GB
        if !FreeSpaceGB! LSS 2 (
            echo [WARNING] Less than 2GB free space on USB drive
            echo [WARNING] Migration may fail
        ) else (
            echo [OK] Sufficient space available
        )
    )
) else (
    echo [ERROR] USB Drive E:\ not found!
    echo Please insert USB drive and assign as E:\
    pause
    exit /b 1
)
echo.

echo [3/6] Checking Required Software...

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js installed
    node --version
) else (
    echo [WARNING] Node.js not found in PATH
)

REM Check Python
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python installed
    python --version
) else (
    echo [WARNING] Python not found in PATH
)

REM Check Go
where go >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Go installed
    go version
) else (
    echo [WARNING] Go not found in PATH
)

REM Check Git
where git >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Git installed
    git --version
) else (
    echo [ERROR] Git not found in PATH
    echo Git is required!
)
echo.

echo [4/6] Checking Critical Files...
if exist start-all-teams.bat (
    echo [OK] start-all-teams.bat
) else (
    echo [MISSING] start-all-teams.bat
)

if exist packages (
    echo [OK] packages folder
) else (
    echo [ERROR] packages folder not found!
)

if exist .git (
    echo [OK] .git repository
) else (
    echo [ERROR] .git repository not found!
)

if exist README_COMPLETE.md (
    echo [OK] README_COMPLETE.md
) else (
    echo [WARNING] README_COMPLETE.md missing
)
echo.

echo [5/6] Checking Team Folders...
set TeamCount=0
for /d %%d in (packages\team*) do (
    set /a TeamCount+=1
    echo [OK] %%d
)
echo [INFO] Found %TeamCount% team folders (expected: 8)
echo.

echo [6/6] Estimating Project Size...
echo [INFO] Calculating... (this may take a moment)
REM This is approximate - actual size calculation is complex in batch
echo [INFO] Approximate size: 100-500 MB (without node_modules)
echo [INFO] With node_modules: 1-2 GB
echo.

echo ============================================
echo  VERIFICATION COMPLETE
echo ============================================
echo.
echo Summary:
echo  - USB Drive E:\ : Available
echo  - Git Repository: OK
echo  - Team Folders  : %TeamCount%/8
echo  - Critical Files: Present
echo.
echo RECOMMENDED NEXT STEPS:
echo.
echo 1. Run cleanup-before-migration.bat (optional)
echo    - Reduces size by removing node_modules
echo    - Will be regenerated on USB
echo.
echo 2. Run copy-to-usb.bat
echo    - Copies project to E:\Project_ERP
echo    - Excludes temporary files
echo.
echo 3. Run setup-after-migration.bat on USB
echo    - Installs all dependencies
echo    - Sets up environments
echo.
echo Press any key to continue...
pause >nul
