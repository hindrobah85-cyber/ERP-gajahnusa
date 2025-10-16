@echo off
echo ============================================
echo  CLEANUP BEFORE MIGRATION
echo  Removing unnecessary files...
echo ============================================
echo.

echo This script will remove:
echo  - All node_modules folders
echo  - Python __pycache__ and venv folders
echo  - Build artifacts (.next, dist, build)
echo  - Temporary files
echo.
echo These will be regenerated after migration.
echo.
pause

echo.
echo [CLEANING UP...]
echo.

REM Count folders before cleanup
echo [INFO] Calculating folder sizes...

REM Remove node_modules in all teams
echo [1/5] Removing node_modules folders...
for /d /r %%d in (node_modules) do (
    if exist "%%d" (
        echo   Removing: %%d
        rd /s /q "%%d" 2>nul
    )
)

REM Remove Python cache
echo [2/5] Removing Python cache...
for /d /r %%d in (__pycache__) do (
    if exist "%%d" (
        echo   Removing: %%d
        rd /s /q "%%d" 2>nul
    )
)

REM Remove Python venv
echo [3/5] Removing Python virtual environments...
for /d /r %%d in (venv) do (
    if exist "%%d" (
        echo   Removing: %%d
        rd /s /q "%%d" 2>nul
    )
)

REM Remove build artifacts
echo [4/5] Removing build artifacts...
for /d /r %%d in (.next) do (
    if exist "%%d" (
        echo   Removing: %%d
        rd /s /q "%%d" 2>nul
    )
)
for /d /r %%d in (dist) do (
    if exist "%%d" (
        echo   Removing: %%d
        rd /s /q "%%d" 2>nul
    )
)
for /d /r %%d in (build) do (
    if exist "%%d" (
        echo   Removing: %%d
        rd /s /q "%%d" 2>nul
    )
)

REM Remove Vite cache
echo [5/5] Removing Vite cache...
for /d /r %%d in (.vite) do (
    if exist "%%d" (
        echo   Removing: %%d
        rd /s /q "%%d" 2>nul
    )
)

echo.
echo ============================================
echo  CLEANUP COMPLETE!
echo ============================================
echo.
echo Removed:
echo  - All node_modules folders
echo  - Python __pycache__ folders
echo  - Python venv folders
echo  - Build artifacts (.next, dist, build)
echo  - Vite cache
echo.
echo Project is now ready for migration!
echo Estimated size reduction: 500MB - 1GB
echo.
pause
