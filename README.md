# 🐘 GAJAH NUSA ERP - Anti-Fraud System

## 📖 Overview

GAJAH NUSA ERP adalah sistem Enterprise Resource Planning yang terintegrasi dengan teknologi Machine Learning untuk deteksi fraud. Sistem ini dirancang untuk mengelola operasi bisnis dengan fokus pada keamanan dan efisiensi.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Admin     │    │   Mobile App    │    │   External      │
│   Dashboard     │    │   (Sales/Drive) │    │   Systems       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────────┐
         │              API Gateway                    │
         │              (Nginx)                       │
         └─────────────────────────────────────────────┘
                                 │
    ┌─────────────────────────────┼─────────────────────────────┐
    │                             │                             │
┌───▼──────────┐        ┌────────▼────────┐        ┌──────────▼───┐
│   Backend    │        │   ML Engine     │        │   Database   │
│   API        │◄──────►│   Microservice  │◄──────►│   PostgreSQL │
│   (FastAPI)  │        │   (Python)      │        │   + Redis    │
└──────────────┘        └─────────────────┘        └──────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (untuk development)
- Python 3.11+ (untuk development)
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd Project_ERP
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables sesuai kebutuhan
```

### 3. Start with Docker (Recommended)
```bash
# Build and start all services
docker-compose up -d

# Check services status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Development Setup (Alternative)
```bash
# Install all dependencies
npm run install:all

# Setup backend
npm run setup:backend

# Setup database
npm run setup:db

# Start development servers
npm run dev
```

## 📱 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend Web App | http://localhost:3000 | Admin Dashboard |
| Backend API | http://localhost:8000 | REST API |
| API Documentation | http://localhost:8000/docs | Swagger UI |
| ML Engine | http://localhost:8001 | ML Predictions |
| Database | localhost:5432 | PostgreSQL |
| Redis Cache | localhost:6379 | Redis |

## 🎯 Features

### 💼 Business Management
- **Customer Management**: Profil pelanggan, credit limit, risk scoring
- **Order Management**: Pemesanan, approval workflow, status tracking
- **Payment Processing**: Multi-payment methods, verification, fraud detection
- **Delivery Tracking**: Route optimization, real-time tracking
- **Sales Management**: Visit tracking, target monitoring

### 🤖 Machine Learning
- **Fraud Detection**: Real-time transaction analysis
- **Demand Prediction**: Inventory optimization
- **Route Optimization**: Delivery route optimization
- **Customer Analytics**: Risk scoring, behavior analysis

### 📱 Mobile Features
- **Offline Support**: SQLite local storage with sync
- **GPS Tracking**: Real-time location for sales visits
- **Camera Integration**: Photo capture for proof of delivery
- **Push Notifications**: Real-time alerts and updates

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### Mobile Development
```bash
cd mobile
npm install
npx expo start
```

### ML Engine Development
```bash
cd ml-engine
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8001
```

## 📊 Project Structure

```
Project_ERP/
├── 📱 frontend/          # React Web Admin Dashboard
├── 📱 mobile/            # React Native Mobile App
├── 🔧 backend/           # FastAPI Backend Server
├── 🤖 ml-engine/         # Machine Learning Microservice
├── 🗄️ database/          # Database initialization
├── 🐳 docker/            # Docker configurations
└── 📚 docs/              # Documentation
```

## 🔐 Environment Variables

Salin `.env.example` ke `.env` dan sesuaikan dengan konfigurasi Anda:

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-super-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Configuration
DEBUG=False
CORS_ORIGINS=["http://localhost:3000"]
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 📦 Deployment

### Production Docker
```bash
# Build production images
docker-compose build

# Deploy to production
docker-compose up -d
```

## 🔍 Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Health Checks
```bash
# Backend health
curl http://localhost:8000/health

# ML Engine health
curl http://localhost:8001/health
```

## 📞 Support & Documentation

- [Architecture Guide](./ARCHITECTURE.md)
- [API Documentation](http://localhost:8000/docs)
- [ML Engine Documentation](http://localhost:8001/docs)

## 📝 License

Copyright © 2025 GAJAH NUSA. All rights reserved.
