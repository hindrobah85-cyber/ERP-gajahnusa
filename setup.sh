#!/bin/bash
# GAJAH NUSA ERP - Setup Script for Linux/Mac
# ============================================

echo "========================================"
echo " GAJAH NUSA ERP - SETUP INSTALLER"
echo "========================================"
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed"
    echo "Please install Python 3.13+ first"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed"
    echo "Please install Node.js LTS first"
    exit 1
fi

echo "[INFO] Setting up Python virtual environment..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo "[SUCCESS] Virtual environment created"
else
    echo "[INFO] Virtual environment already exists"
fi

echo
echo "[INFO] Activating virtual environment..."
source .venv/bin/activate

echo
echo "[INFO] Installing Python dependencies..."
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install Python dependencies"
    exit 1
fi

echo
echo "[INFO] Setting up Frontend dependencies..."
cd frontend
npm install

if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install Frontend dependencies"
    cd ..
    exit 1
fi

cd ..

echo
echo "[INFO] Creating necessary directories..."
mkdir -p models logs uploads

echo
echo "[INFO] Setting up database..."
python -c "from backend.app.models.database import create_tables; create_tables(); print('Database initialized successfully')"

echo
echo "========================================"
echo " SETUP COMPLETED SUCCESSFULLY!"
echo "========================================"
echo
echo "To start the system:"
echo "1. Backend:  ./start_backend.sh"
echo "2. Frontend: ./start_frontend.sh" 
echo "3. Full:     ./start_all.sh"
echo
echo "Documentation: ENVIRONMENT.md"
echo
