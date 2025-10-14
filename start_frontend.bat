@echo off
REM Start Frontend Server
echo Starting GAJAH NUSA ERP Frontend...
cd /d "%~dp0\frontend"
npm run dev
