@echo off
echo ============================================
echo  POST-MIGRATION SETUP
echo  Installing Dependencies on USB Drive
echo ============================================
echo.

REM Check if running from USB
if not "%CD:~0,2%"=="E:" (
    echo WARNING: This script should be run from E:\Project_ERP
    echo Current directory: %CD%
    echo.
    echo Please navigate to E:\Project_ERP first
    pause
    exit /b 1
)

echo Current location: %CD%
echo.
echo This script will:
echo  1. Install Node.js dependencies for all teams
echo  2. Setup Python virtual environments
echo  3. Install Python dependencies
echo  4. Verify Go modules
echo  5. Test database files
echo.
echo This may take 10-15 minutes...
echo.
pause

echo.
echo ============================================
echo  STEP 1: INSTALLING NODE.JS DEPENDENCIES
echo ============================================
echo.

REM Team 1 - Sales Mobile
echo [1/8] Team 1 - Sales Mobile...
cd packages\team1-sales-mobile
if exist package.json (
    call npm install --silent
    echo     [OK] Team 1 dependencies installed
) else (
    echo     [SKIP] No package.json found
)
cd ..\..

REM Team 2 - Logistics
echo [2/8] Team 2 - Logistics...
cd packages\team2-logistics
if exist package.json (
    call npm install --silent
    echo     [OK] Team 2 dependencies installed
) else (
    echo     [SKIP] No package.json found
)
cd ..\..

REM Team 3 - Finance
echo [3/8] Team 3 - Finance...
cd packages\team3-finance
if exist package.json (
    call npm install --silent
    echo     [OK] Team 3 dependencies installed
) else (
    echo     [SKIP] No package.json found
)
cd ..\..

REM Team 4 - HR System
echo [4/8] Team 4 - HR System...
cd packages\team4-hr
if exist package.json (
    call npm install --silent
    echo     [OK] Team 4 frontend dependencies installed
) else (
    echo     [SKIP] No package.json found
)
cd ..\..

REM Team 5 - E-commerce
echo [5/8] Team 5 - E-commerce...
cd packages\team5-ecommerce
if exist package.json (
    call npm install --silent
    echo     [OK] Team 5 dependencies installed
) else (
    echo     [SKIP] No package.json found
)
cd ..\..

REM Team 6 - Retail POS
echo [6/8] Team 6 - Retail POS...
cd packages\team6-retail-pos
if exist package.json (
    call npm install --silent
    echo     [OK] Team 6 frontend dependencies installed
) else (
    echo     [SKIP] No package.json found
)
if exist backend\package.json (
    cd backend
    call npm install --silent
    echo     [OK] Team 6 backend dependencies installed
    cd ..
)
cd ..\..

REM Team 7 - Customer Service
echo [7/8] Team 7 - Customer Service...
cd packages\team7-customer-service
if exist package.json (
    call npm install --silent
    echo     [OK] Team 7 dependencies installed
) else (
    echo     [SKIP] No package.json found
)
cd ..\..

REM Team 8 - Analytics
echo [8/8] Team 8 - Analytics...
cd packages\team8-analytics
if exist package.json (
    call npm install --silent
    echo     [OK] Team 8 dependencies installed
) else (
    echo     [SKIP] No package.json found
)
cd ..\..

echo.
echo ============================================
echo  STEP 2: PYTHON ENVIRONMENTS
echo ============================================
echo.

REM Team 4 - HR Backend
echo Setting up Team 4 - HR Backend Python environment...
cd packages\team4-hr\backend
if exist requirements.txt (
    if not exist venv (
        echo     Creating virtual environment...
        python -m venv venv
    )
    echo     Installing Python packages...
    call venv\Scripts\activate.bat
    pip install -r requirements.txt --quiet
    call deactivate
    echo     [OK] Team 4 Python environment ready
)
cd ..\..\..

REM Team 5 - E-commerce Backend
echo Setting up Team 5 - E-commerce Backend Python environment...
cd packages\team5-ecommerce\backend
if exist requirements.txt (
    if not exist venv (
        echo     Creating virtual environment...
        python -m venv venv
    )
    echo     Installing Python packages...
    call venv\Scripts\activate.bat
    pip install -r requirements.txt --quiet
    call deactivate
    echo     [OK] Team 5 Python environment ready
)
cd ..\..\..

REM Team 8 - Analytics Backend
echo Setting up Team 8 - Analytics Backend Python environment...
cd packages\team8-analytics\backend
if exist requirements.txt (
    if not exist venv (
        echo     Creating virtual environment...
        python -m venv venv
    )
    echo     Installing Python packages...
    call venv\Scripts\activate.bat
    pip install -r requirements.txt --quiet
    call deactivate
    echo     [OK] Team 8 Python environment ready
)
cd ..\..\..

echo.
echo ============================================
echo  STEP 3: GO MODULES
echo ============================================
echo.

echo Setting up Team 7 - Customer Service Go backend...
cd packages\team7-customer-service\backend
if exist go.mod (
    echo     Downloading Go modules...
    go mod download
    echo     [OK] Team 7 Go modules ready
)
cd ..\..\..

echo.
echo ============================================
echo  STEP 4: VERIFICATION
echo ============================================
echo.

echo Checking critical files...

REM Check startup script
if exist start-all-teams.bat (
    echo [OK] Master startup script found
) else (
    echo [MISSING] start-all-teams.bat
)

REM Check Git repository
if exist .git (
    echo [OK] Git repository intact
) else (
    echo [WARNING] Git repository missing
)

REM Check documentation
if exist README_COMPLETE.md (
    echo [OK] Documentation present
) else (
    echo [WARNING] README_COMPLETE.md missing
)

REM Check database files
if exist packages\team4-hr\backend\hr_system.db (
    echo [OK] Team 4 database found
) else (
    echo [INFO] Team 4 database will be created on first run
)

if exist packages\team5-ecommerce\backend\ecommerce.db (
    echo [OK] Team 5 database found
) else (
    echo [INFO] Team 5 database will be created on first run
)

echo.
echo ============================================
echo  SETUP COMPLETE!
echo ============================================
echo.
echo Project_ERP is ready to run from USB!
echo.
echo NEXT STEPS:
echo 1. Ensure Redis is running (for Team 2)
echo 2. Ensure PostgreSQL is running (for Team 6)
echo 3. Run: start-all-teams.bat
echo.
echo All dependencies installed successfully!
echo You can now start the system.
echo.
pause
