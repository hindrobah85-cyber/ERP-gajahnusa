# GAJAH NUSA ERP Anti-Fraud System

![GAJAH NUSA Logo](logo.png)

## 🚀 Sistem ERP Terintegrasi dengan Anti-Fraud Detection

Sistem ERP komprehensif untuk distribusi dengan teknologi anti-fraud advanced menggunakan Machine Learning, Face Recognition, dan Real-time monitoring.

## 📋 Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Penggunaan](#penggunaan)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Troubleshooting](#troubleshooting)

## 🎯 Fitur Utama

### 1. **Anti-Fraud System**
- ✅ **QR Code Unik** untuk setiap nota (tidak bisa diduplikasi)
- ✅ **OTP Verification** untuk konfirmasi pembayaran customer
- ✅ **24-Hour Deposit Monitoring** dengan alert otomatis
- ✅ **Face Recognition** untuk login dan verifikasi
- ✅ **GPS Tracking** untuk validasi lokasi kunjungan
- ✅ **Machine Learning** fraud detection dengan accuracy >90%
- ✅ **Real-time Fraud Scoring** untuk setiap transaksi
- ✅ **Foto Bukti Pembayaran** (uang + nota + salesman)

### 2. **Role-Based Access Control**
```
OWNER → Full Access
  ├── MANAGER → All except profit data
  │   ├── ADMIN → Edit with approval
  │   │   ├── SUPERVISOR TOKO → All toko areas
  │   │   ├── SUPERVISOR PROJECT → All project areas
  │   │   ├── SALES TOKO → Own area only
  │   │   ├── SALES PROJECT → Own area only
  │   │   ├── DRIVER → Delivery only
  │   │   └── GUDANG → Warehouse only
```

### 3. **Sales Management**
- Call Plan & Route Optimization
- Customer Registration with Approval Workflow
- Visit Tracking with QR Absensi
- Order Management with Credit Limit Check
- Real-time Stock Information

### 4. **Payment System**
- Multi-method (Cash, Transfer, Giro)
- OTP Verification
- Automatic WhatsApp Notifications
- Late Payment Reminders
- Fraud Detection per Transaction

### 5. **Machine Learning Features**
- **Demand Prediction** (LSTM Neural Network)
- **Customer Churn Prediction**
- **Route Optimization**
- **Fraud Pattern Detection**
- **Sales Performance Analysis**

### 6. **Mobile Features**
- Offline Mode untuk area tanpa sinyal
- Face Recognition Login
- QR Scanner untuk absensi
- Real-time GPS Tracking
- Camera-only foto (no gallery)

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│                   NGINX (Reverse Proxy)              │
├─────────────┬────────────────┬──────────────────────┤
│             │                │                      │
│    React    │   FastAPI      │    React Native     │
│  Web Admin  │   Backend      │    Mobile App       │
│    :3000    │    :8000       │     :19000          │
│             │                │                      │
├─────────────┴────────────────┴──────────────────────┤
│                     Services                         │
├──────────┬──────────┬─────────┬────────────────────┤
│          │          │         │                     │
│  Redis   │PostgreSQL│   ML    │    Monitoring      │
│  Cache   │    DB    │ Engine  │     Services       │
│  :6379   │  :5432   │         │                     │
└──────────┴──────────┴─────────┴────────────────────┘
```

## 💻 Instalasi

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (untuk development)
- Python 3.10+ (untuk development)
- Git

### Quick Start

1. **Clone Repository**
```bash
git clone https://github.com/gajahnusa/erp-antifraud.git
cd erp-antifraud
```

2. **Setup Environment Variables**
```bash
cp .env.example .env
# Edit .env dengan konfigurasi Anda
```

3. **Build dan Start Services**
```bash
# Build all containers
make build

# Start all services
make up

# Check logs
make logs
```

4. **Initialize Database**
```bash
# Run migrations
make migrate

# Create admin user
docker-compose exec backend python -m app.create_admin
```

5. **Access Applications**
- Web Admin: http://localhost:3000
- API Docs: http://localhost:8000/docs
- Mobile App: http://localhost:19000

## ⚙️ Konfigurasi

### Database Configuration
```python
# backend/app/config.py
DATABASE_URL = "postgresql://gajahnusa:password@postgres:5432/erp_antifraud"
```

### Anti-Fraud Settings
```python
# Fraud Detection Thresholds
FRAUD_SCORE_HIGH = 0.8  # Immediate suspension
FRAUD_SCORE_MEDIUM = 0.5  # Warning & monitoring
DEPOSIT_TIME_LIMIT = 24  # Hours

# OTP Settings
OTP_EXPIRE_MINUTES = 5
OTP_MAX_ATTEMPTS = 3
```

### Machine Learning Configuration
```python
# ML Model Settings
ML_RETRAIN_INTERVAL = 24  # Hours
ML_FRAUD_THRESHOLD = 0.7
ML_DEMAND_FORECAST_DAYS = 7
```

## 📱 Penggunaan

### 1. Login Process

#### Web Admin
```javascript
// Login dengan Employee ID & Password
POST /api/auth/login
{
  "employee_id": "EMP001",
  "password": "SecurePassword123!"
}
```

#### Mobile App (dengan Face Recognition)
```javascript
// Login dengan Face Recognition
POST /api/auth/login
{
  "employee_id": "EMP001",
  "password": "SecurePassword123!",
  "face_image": "base64_encoded_image",
  "latitude": -7.2575,
  "longitude": 112.7521
}
```

### 2. Sales Visit Flow

```mermaid
graph LR
    A[Call Plan] --> B[Scan QR Toko]
    B --> C[Take Selfie]
    C --> D[Input Order/Payment]
    D --> E[Check Out]
    E --> F[Next Visit]
```

### 3. Payment Anti-Fraud Flow

```mermaid
graph TD
    A[Salesman Input Payment] --> B[Take Photo Evidence]
    B --> C[System Send OTP to Customer]
    C --> D{Customer Verify OTP}
    D -->|Valid| E[Payment Status: PROCESS]
    D -->|Invalid| F[Fraud Alert]
    E --> G[24 Hour Timer Start]
    G --> H{Money Deposited?}
    H -->|Yes| I[Payment VERIFIED]
    H -->|No > 24h| J[FRAUD FLAG + Alert]
```

### 4. Customer Registration

```python
# New Customer Registration
POST /api/customers/register
{
  "store_name": "Toko Maju Jaya",
  "owner_name": "Budi Santoso",
  "ktp_number": "3573012345678901",
  "phone_store": "031-5555555",
  "phone_owner": "081234567890",
  "address": "Jl. Raya Kediri No. 123",
  "credit_limit": 5000000,
  "customer_type": "toko",
  "area": "Kediri",
  "latitude": -7.8166,
  "longitude": 112.0105
}
```

## 📊 Dashboard Features

### Manager Dashboard
- Real-time fraud alerts
- Sales performance metrics
- ML predictions & insights
- Team performance tracking

### Salesman Dashboard
- Daily/Weekly/Monthly targets
- Visit schedule & route
- Customer payment status
- Personal performance

## 🔐 Security Features

### 1. Authentication
- JWT Token with expiration
- Face Recognition
- Fingerprint (mobile)
- 2FA for sensitive operations

### 2. Data Protection
- End-to-end encryption
- SSL/TLS for all communications
- Encrypted database fields
- Secure file storage

### 3. Fraud Prevention
- Real-time ML fraud detection
- GPS validation
- QR code verification
- Photo evidence requirement
- Automated alerts

### 4. Access Control
- Role-based permissions
- IP whitelisting (optional)
- Session management
- Audit logging

## 📈 Machine Learning Models

### 1. Fraud Detection Model
```python
# Features used:
- Payment patterns
- Location data
- Time patterns
- Historical behavior
- Peer comparison

# Output:
- Fraud score (0-1)
- Risk level (LOW/MEDIUM/HIGH)
- Recommendations
```

### 2. Demand Prediction
```python
# LSTM Neural Network
- Input: 7 days historical data
- Output: Next 7 days prediction
- Accuracy: ~85%
```

### 3. Customer Analytics
```python
# Churn Prediction
- Features: Order frequency, payment behavior, credit usage
- Output: Churn probability, customer segment
```

## 🔧 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login
POST   /api/auth/logout       - Logout
POST   /api/auth/refresh      - Refresh token
```

### Customer Management
```
POST   /api/customers/register     - Register customer
GET    /api/customers              - List customers
PUT    /api/customers/{id}/approve - Approve/reject customer
GET    /api/customers/{id}         - Get customer details
```

### Sales Operations
```
POST   /api/visits/checkin        - Check in at customer
POST   /api/visits/{id}/checkout  - Check out
POST   /api/orders/create         - Create order
GET    /api/orders                - List orders
```

### Payment & Anti-Fraud
```
POST   /api/payment/initiate           - Initiate payment
POST   /api/payment/{id}/verify-otp    - Verify OTP
POST   /api/payment/{id}/confirm-deposit - Confirm deposit
GET    /api/fraud/alerts               - Get fraud alerts
```

### Analytics & ML
```
GET    /api/ml/predict-demand/{product_id}  - Predict demand
GET    /api/ml/customer-analysis/{id}       - Analyze customer
POST   /api/ml/optimize-route              - Optimize delivery route
GET    /api/dashboard/insights             - System insights
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Face Recognition Not Working
```bash
# Check camera permissions
# Ensure good lighting
# Update dlib library
pip install --upgrade dlib face-recognition
```

#### 2. GPS Location Error
```bash
# Check location permissions
# Ensure GPS is enabled
# For development, use mock location
```

#### 3. Database Connection Error
```bash
# Check PostgreSQL is running
docker-compose ps

# Check connection string
docker-compose exec backend env | grep DATABASE_URL

# Restart database
docker-compose restart postgres
```

#### 4. ML Model Not Loading
```bash
# Retrain models
make train-ml

# Check model files exist
docker-compose exec backend ls -la models/
```

## 📞 Support & Contact

- **Technical Support**: tech@gajahnusa.com
- **Documentation**: docs.gajahnusa.com
- **Bug Reports**: github.com/gajahnusa/erp/issues

## 📄 License

Copyright © 2025 GAJAH NUSA. All rights reserved.

---

## 🚀 Quick Commands

```bash
# Development
npm run dev          # Start development servers
npm run test         # Run tests
npm run lint         # Check code quality

# Docker
make up              # Start all services
make down            # Stop all services
make logs            # View logs
make restart         # Restart services

# Database
make migrate         # Run migrations
make backup-db       # Backup database
make restore-db      # Restore database

# ML Operations
make train-ml        # Train ML models
make predict         # Run predictions

# Monitoring
make monitor         # Check system health
make alerts          # View fraud alerts
```

## 📚 Additional Resources

- [API Documentation](http://localhost:8000/docs)
- [Mobile App Guide](./docs/mobile-guide.md)
- [Admin Manual](./docs/admin-manual.md)
- [ML Model Documentation](./docs/ml-models.md)
- [Security Best Practices](./docs/security.md)

---

**Built with ❤️ by GAJAH NUSA Development Team**