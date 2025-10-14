@echo off
REM GAJAH NUSA ERP Setup Script for Windows
REM Automated setup for development environment

echo 🐘 GAJAH NUSA ERP - Setup Script
echo ==================================

REM Check if Docker is installed
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.11+ first.
    exit /b 1
)

echo ✅ All prerequisites are installed

REM Create environment file if it doesn't exist
if not exist .env (
    echo 📝 Creating environment file...
    copy .env.example .env
    echo ✅ Environment file created. Please edit .env with your configuration.
) else (
    echo ✅ Environment file already exists
)

REM Install root dependencies
echo 📦 Installing root dependencies...
npm install

REM Setup Frontend
echo 🎨 Setting up Frontend...
cd frontend
npm install
cd ..

REM Setup Mobile
echo 📱 Setting up Mobile App...
cd mobile
npm install
cd ..

REM Setup Backend Python environment
echo 🔧 Setting up Backend...
cd backend
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
cd ..

REM Setup ML Engine
echo 🤖 Setting up ML Engine...
cd ml-engine
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
cd ..

REM Create necessary directories
echo 📁 Creating directories...
if not exist backend\uploads mkdir backend\uploads
if not exist backend\logs mkdir backend\logs
if not exist ml-engine\models mkdir ml-engine\models
if not exist ml-engine\data mkdir ml-engine\data
if not exist ml-engine\logs mkdir ml-engine\logs

echo 🐳 Starting Docker services...
docker-compose up -d postgres redis

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Edit .env file with your configuration
echo 2. Start development servers:
echo    npm run dev
echo.
echo 🌐 Service URLs:
echo    Frontend:  http://localhost:3000
echo    Backend:   http://localhost:8000
echo    ML Engine: http://localhost:8001
echo    API Docs:  http://localhost:8000/docs
echo.
echo Happy coding! 🚀
