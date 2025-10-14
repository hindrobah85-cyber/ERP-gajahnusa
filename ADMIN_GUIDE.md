# GAJAH NUSA ERP - Administrator Guide
# Panduan Lengkap untuk Administrator Sistem

## Daftar Isi
1. [Instalasi dan Setup](#instalasi-dan-setup)
2. [Konfigurasi Sistem](#konfigurasi-sistem)
3. [Manajemen Pengguna](#manajemen-pengguna)
4. [Monitoring dan Pemeliharaan](#monitoring-dan-pemeliharaan)
5. [Backup dan Recovery](#backup-dan-recovery)
6. [Troubleshooting](#troubleshooting)

## Instalasi dan Setup

### Persyaratan Sistem
- Windows 10/11 atau Linux
- Python 3.13+
- Node.js 18+
- Docker Desktop
- 8GB RAM minimum
- 50GB disk space

### Langkah Instalasi

#### 1. Setup Lingkungan Development
```powershell
# Clone atau copy project ke C:\Project_ERP
Set-Location C:\Project_ERP

# Install dependencies Python
pip install -r requirements.txt

# Install dependencies Node.js
cd mobile
npm install --legacy-peer-deps
cd ..
```

#### 2. Konfigurasi Environment
```powershell
# Copy template environment
Copy-Item .env.example .env.production

# Edit file .env.production sesuai kebutuhan
notepad .env.production
```

#### 3. Build Production
```powershell
# Run build script
.\build-production.ps1

# Deploy to production
.\deploy-production.ps1
```

## Konfigurasi Sistem

### File Konfigurasi Utama

#### `.env.production`
```
# Database
DATABASE_URL=postgresql://erp_user:secure_password@localhost:5432/erp_production

# API Configuration
API_BASE_URL=https://api.gajahnusa.com
SECRET_KEY=your-super-secure-secret-key
JWT_SECRET_KEY=your-jwt-secret-key

# Security
ALLOWED_ORIGINS=["https://gajahnusa.com"]
```

#### `docker-compose.production.yml`
- Konfigurasi database PostgreSQL
- Setup backend FastAPI
- Nginx reverse proxy
- Redis cache

### Konfigurasi Database
```sql
-- Create production database
CREATE DATABASE erp_production;
CREATE USER erp_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE erp_production TO erp_user;
```

## Manajemen Pengguna

### Menambah Pengguna Baru
1. Login ke sistem sebagai admin
2. Buka menu "User Management"
3. Klik "Add New User"
4. Isi data pengguna:
   - Employee ID
   - Nama lengkap
   - Role (admin, sales, manager)
   - Password

### Reset Password
```powershell
# Run password reset script
python scripts/reset_password.py --user EMP001 --new-password newpass123
```

### Manajemen Role
- **Admin**: Full access ke semua fitur
- **Sales**: Akses customer, payment, basic reports
- **Manager**: Akses reports, dashboard, user management

## Monitoring dan Pemeliharaan

### Monitoring Otomatis
```powershell
# Start system monitoring
.\monitor-system.ps1 -IntervalSeconds 60 -SendAlerts
```

### Metrics yang Dipantau
- CPU usage (threshold: 80%)
- Memory usage (threshold: 85%)
- Disk usage (threshold: 90%)
- API response time (threshold: 2000ms)
- Database connectivity
- Service availability

### Log Files
- **Application logs**: `./logs/production.log`
- **Monitoring logs**: `./monitoring.log`
- **Error logs**: `./logs/error.log`

### Health Check Manual
```powershell
# Quick system test
.\quick-test.ps1

# Comprehensive test
.\test-system.ps1 -TestSuite all
```

## Backup dan Recovery

### Backup Otomatis
```powershell
# Full backup (database + files)
.\backup-system.ps1 -BackupType full

# Database only
.\backup-system.ps1 -BackupType database

# Files only
.\backup-system.ps1 -BackupType files
```

### Jadwal Backup Otomatis
```powershell
# Setup scheduled backup (daily at 2 AM)
schtasks /create /tn "ERP Backup" /tr "C:\Project_ERP\backup-system.ps1" /sc daily /st 02:00
```

### Recovery Process
1. Stop semua services:
   ```powershell
   docker-compose -f docker-compose.production.yml down
   ```

2. Extract backup:
   ```powershell
   Expand-Archive "backup_20250909_120000.zip" -DestinationPath ".\restore"
   ```

3. Restore database:
   ```powershell
   docker exec erp_database_prod psql -U erp_user erp_production < restore/database_postgresql_*.sql
   ```

4. Restore files:
   ```powershell
   Copy-Item -Path "restore\*" -Destination ".\" -Recurse -Force
   ```

5. Restart services:
   ```powershell
   docker-compose -f docker-compose.production.yml up -d
   ```

## Troubleshooting

### Masalah Umum

#### Backend API Tidak Dapat Diakses
**Gejala**: Error 503 atau timeout
**Solusi**:
1. Check service status:
   ```powershell
   docker ps
   ```
2. Restart backend:
   ```powershell
   docker restart erp_backend_prod
   ```
3. Check logs:
   ```powershell
   docker logs erp_backend_prod
   ```

#### Database Connection Error
**Gejala**: "Connection refused" atau "Authentication failed"
**Solusi**:
1. Check PostgreSQL status:
   ```powershell
   docker exec erp_database_prod pg_isready
   ```
2. Verify credentials in `.env.production`
3. Restart database:
   ```powershell
   docker restart erp_database_prod
   ```

#### Mobile App Tidak Load
**Gejala**: Blank screen atau loading forever
**Solusi**:
1. Check Expo server:
   ```powershell
   npx expo start --web
   ```
2. Clear browser cache
3. Check API_BASE_URL in mobile config

#### High Memory Usage
**Gejala**: System slow, memory usage > 90%
**Solusi**:
1. Restart services:
   ```powershell
   docker-compose restart
   ```
2. Check for memory leaks in logs
3. Increase server resources if needed

### Performance Optimization

#### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_transactions_date ON transactions(created_at);
CREATE INDEX idx_customers_employee_id ON customers(employee_id);
```

#### Cache Configuration
```python
# Redis cache settings
CACHE_TTL = 300  # 5 minutes
CACHE_MAX_ENTRIES = 10000
```

#### API Rate Limiting
```python
# FastAPI rate limiting
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter

@app.get("/api/data")
@RateLimiter(times=100, seconds=60)
async def get_data():
    # API endpoint
```

## Maintenance Tasks

### Daily Tasks
- [ ] Check system monitoring dashboard
- [ ] Review error logs
- [ ] Verify backup completion
- [ ] Check disk space usage

### Weekly Tasks
- [ ] Update system packages
- [ ] Review user access logs
- [ ] Clean old log files
- [ ] Performance analysis

### Monthly Tasks
- [ ] Security audit
- [ ] Database maintenance
- [ ] Backup restoration test
- [ ] User access review
- [ ] System performance report

## Security Best Practices

### Access Control
- Use strong passwords (minimum 12 characters)
- Enable 2FA for admin accounts
- Regular password rotation (90 days)
- Principle of least privilege

### Network Security
- Use HTTPS only in production
- Configure firewall rules
- VPN access for remote management
- Regular security updates

### Data Protection
- Encrypt sensitive data at rest
- Backup encryption
- Secure data transmission
- GDPR compliance for customer data

## Contact dan Support

### Tim Support
- **Technical Support**: tech@gajahnusa.com
- **Security Issues**: security@gajahnusa.com
- **Emergency**: +62-xxx-xxx-xxxx

### Dokumentasi Tambahan
- API Documentation: http://localhost:8001/docs
- User Manual: USER_MANUAL.md
- Deployment Guide: DEPLOYMENT_CHECKLIST.md
- Testing Guide: TESTING_PLAN.md

---
*Terakhir diupdate: 9 September 2025*
*Version: 1.0.0*
