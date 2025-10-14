@echo off
cd /d "C:\Project_ERP"
echo Starting HTTP server from: %CD%
python -m http.server 8083
