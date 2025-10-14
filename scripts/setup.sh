#!/bin/bash
# GAJAH NUSA ERP Setup Script
# Automated setup for development environment

echo "🐘 GAJAH NUSA ERP - Setup Script"
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.11+ first."
    exit 1
fi

echo "✅ All prerequisites are installed"

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "✅ Environment file created. Please edit .env with your configuration."
else
    echo "✅ Environment file already exists"
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Setup Frontend
echo "🎨 Setting up Frontend..."
cd frontend
npm install
cd ..

# Setup Mobile
echo "📱 Setting up Mobile App..."
cd mobile
npm install
cd ..

# Setup Backend Python environment
echo "🔧 Setting up Backend..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Setup ML Engine
echo "🤖 Setting up ML Engine..."
cd ml-engine
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/uploads
mkdir -p backend/logs
mkdir -p ml-engine/models
mkdir -p ml-engine/data
mkdir -p ml-engine/logs

echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️ Setting up database..."
cd backend
source venv/bin/activate
# Uncomment when Alembic is configured
# python -m alembic upgrade head
cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start development servers:"
echo "   npm run dev"
echo ""
echo "🌐 Service URLs:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   ML Engine: http://localhost:8001"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo "Happy coding! 🚀"
