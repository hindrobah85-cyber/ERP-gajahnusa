# GAJAH NUSA ERP - ENVIRONMENT SETUP DOCUMENTATION
# Generated: September 8, 2025
# ================================================

## SYSTEM REQUIREMENTS

### Python Environment
- Python Version: 3.13.7
- Virtual Environment: `.venv` (located in project root)
- Package Manager: pip

### Node.js Environment  
- Node.js Version: Latest LTS
- Package Manager: npm
- Build Tool: Vite

## DIRECTORY STRUCTURE
```
C:\Project_ERP\
├── .venv/                     # Python Virtual Environment
├── backend/                   # FastAPI Backend
│   ├── app/
│   │   ├── models/           # Database Models
│   │   ├── services/         # Business Logic
│   │   └── main.py          # FastAPI Application
│   └── requirements-backend.txt
├── frontend/                  # React Frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── ml-engine/                 # Machine Learning Engine
│   ├── models/               # ML Models
│   ├── inference/            # Prediction Services
│   ├── training/             # Model Training
│   ├── main.py
│   └── requirements-ml.txt
├── mobile/                    # React Native Mobile
├── models/                    # Saved ML Models
├── requirements.txt           # All Python Dependencies
├── requirements-organized.txt # Organized Dependencies
└── docker-compose.yml         # Container Orchestration
```

## INSTALLATION COMMANDS

### 1. Python Backend Setup
```bash
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Install all dependencies
pip install -r requirements.txt

# Or install specific components
pip install -r backend/requirements-backend.txt
pip install -r ml-engine/requirements-ml.txt
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Development server
npm run build  # Production build
```

### 3. Database Setup
```bash
# Database will be created automatically on first run
# SQLite file: erp_antifraud.db
```

## RUNNING THE SYSTEM

### Development Mode
```bash
# Terminal 1: Backend API
cd C:\Project_ERP
.venv\Scripts\python.exe start_backend.py

# Terminal 2: Frontend
cd C:\Project_ERP\frontend
npm run dev

# Terminal 3: ML Engine (Optional)
cd C:\Project_ERP\ml-engine
.venv\Scripts\python.exe main.py
```

### Production Mode
```bash
# Using Docker Compose
docker-compose up -d

# Manual Production
npm run build  # Build frontend
uvicorn backend.app.main:app --host 0.0.0.0 --port 8001
```

## ACCESS URLS

- Frontend: http://localhost:5173
- Backend API: http://localhost:8001
- API Documentation: http://localhost:8001/docs
- ML Engine: http://localhost:8002 (if running separately)

## ENVIRONMENT VARIABLES

Create `.env` file in project root:
```
# Database
DATABASE_URL=sqlite:///./erp_antifraud.db

# Authentication
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External Services
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
REDIS_URL=redis://localhost:6379

# ML Engine
ML_ENGINE_URL=http://localhost:8002
MODELS_PATH=./models
```

## DEPENDENCY VERSIONS (FROZEN)

### Core Backend Dependencies
- fastapi==0.116.1
- uvicorn==0.35.0
- sqlalchemy==2.0.43
- pydantic==2.11.7

### Machine Learning Dependencies  
- tensorflow==2.20.0
- scikit-learn==1.7.1
- pandas==2.3.2
- numpy==2.3.2

### Frontend Dependencies
- react==18.3.1
- vite==7.1.5
- tailwindcss==3.3.5
- axios==1.11.0

## TROUBLESHOOTING

### Common Issues
1. **Import Errors**: Ensure virtual environment is activated
2. **Port Conflicts**: Change ports in configuration files
3. **TensorFlow Issues**: TensorFlow is optional, system falls back to scikit-learn
4. **Database Errors**: Delete erp_antifraud.db and restart to recreate

### Performance Optimization
- Use production builds for deployment
- Enable Redis for caching
- Consider PostgreSQL for production database
- Use CDN for static assets

## TESTING

### Backend Tests
```bash
cd backend
python -m pytest
```

### Frontend Tests  
```bash
cd frontend
npm test
```

### ML Engine Tests
```bash
cd ml-engine
python -m pytest
```

## DEPLOYMENT

### Docker Deployment
```bash
docker-compose -f docker-compose.yml up -d
```

### Manual Deployment
1. Build frontend: `npm run build`
2. Configure reverse proxy (nginx)
3. Set up process manager (pm2, systemd)
4. Configure SSL certificates
5. Set up monitoring and logging

---
Last Updated: September 8, 2025
System Status: ✅ Fully Operational
All Dependencies: ✅ Frozen and Documented
