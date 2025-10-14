# GAJAH NUSA ERP - Integrated System Architecture

## 📁 Project Structure Overview

```
Project_ERP/
├── 📱 frontend/                 # Web Admin Dashboard (React + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Admin pages (Dashboard, Reports, etc)
│   │   ├── services/          # API calls & utilities
│   │   ├── hooks/             # React custom hooks
│   │   ├── contexts/          # React contexts (Auth, Theme)
│   │   └── utils/             # Helper functions
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── 📱 mobile/                   # React Native/Expo Mobile App
│   ├── src/
│   │   ├── screens/           # Mobile screens (Login, Sales, Delivery)
│   │   ├── components/        # Mobile UI components
│   │   ├── navigation/        # React Navigation setup
│   │   ├── services/          # API calls for mobile
│   │   ├── hooks/             # Mobile-specific hooks
│   │   └── utils/             # Mobile utilities
│   ├── assets/
│   ├── package.json
│   └── app.json
│
├── 🔧 backend/                  # FastAPI Backend Server
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── models/            # Database models (SQLAlchemy)
│   │   ├── schemas/           # Pydantic schemas for API
│   │   ├── services/          # Business logic layer
│   │   ├── api/               # API endpoints
│   │   ├── core/              # Configuration & security
│   │   ├── ml/                # Machine Learning modules
│   │   └── utils/             # Backend utilities
│   ├── requirements.txt
│   └── Dockerfile
│
├── 🤖 ml-engine/               # Machine Learning Services
│   ├── models/                # Trained ML models
│   ├── training/              # Model training scripts
│   ├── inference/             # Real-time prediction
│   ├── data/                  # Training data & preprocessors
│   └── notebooks/             # Jupyter notebooks for analysis
│
├── 🗄️ database/                # Database setup
│   ├── migrations/            # Database migrations
│   ├── seeds/                 # Seed data
│   └── init.sql              # Database initialization
│
├── 🐳 docker/                  # Containerization
│   ├── Dockerfile.frontend
│   ├── Dockerfile.mobile
│   ├── Dockerfile.backend
│   └── Dockerfile.ml
│
├── 📚 docs/                    # Documentation
│   ├── API.md                 # API documentation
│   ├── DEPLOYMENT.md          # Deployment guide
│   └── ARCHITECTURE.md        # System architecture
│
├── 🔧 scripts/                 # Automation scripts
│   ├── setup.sh              # Project setup
│   ├── deploy.sh              # Deployment script
│   └── backup.sh              # Database backup
│
├── docker-compose.yml         # Multi-service orchestration
├── .env.example              # Environment variables template
├── README.md                 # Project overview
└── package.json              # Root package.json for scripts
```

## 🏗️ System Architecture

### Frontend Layer (Web Admin)
- **Framework**: React 19 + Vite
- **UI Library**: Custom components with responsive design
- **State Management**: React Context + useState/useReducer
- **Routing**: React Router
- **HTTP Client**: Axios

### Mobile Layer (Field Workers)
- **Framework**: React Native + Expo
- **Navigation**: React Navigation 6
- **Offline Support**: Redux Persist + SQLite
- **Camera/Location**: Expo modules
- **Push Notifications**: Expo Notifications

### Backend Layer (API Server)
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with role-based access
- **File Storage**: MinIO/S3
- **Cache**: Redis
- **Queue**: Celery for background tasks

### ML Engine Layer
- **Training**: Scikit-learn, TensorFlow, PyTorch
- **Inference**: FastAPI microservice
- **Models**: Fraud detection, demand prediction, route optimization
- **Data Pipeline**: Apache Airflow
- **Model Serving**: MLflow

### Infrastructure Layer
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (production)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack

## 🔄 Data Flow

1. **Mobile App** → **Backend API** → **Database**
2. **Web Admin** → **Backend API** → **Database**
3. **Backend** → **ML Engine** → **Predictions**
4. **ML Engine** → **Database** → **Analytics Dashboard**

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repository>
cd Project_ERP

# Setup all services
./scripts/setup.sh

# Run development environment
docker-compose up -d
```

## 🔗 Service URLs

- **Web Admin**: http://localhost:3000
- **Mobile App**: Expo Dev Tools
- **Backend API**: http://localhost:8000
- **ML Engine**: http://localhost:8001
- **Database**: localhost:5432
- **Redis**: localhost:6379
