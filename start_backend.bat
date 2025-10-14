@echo off
REM Start Backend Server
echo Starting GAJAH NUSA ERP Backend...
cd /d "%~dp0"
call .venv\Scripts\activate.bat
.venv\Scripts\python.exe start_backend.py
