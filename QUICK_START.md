# GAJAH NUSA ERP - QUICK START GUIDE
# Panduan Cepat untuk Memulai

## 🚀 START SYSTEM (Development)

### 1. Start Backend API
```powershell
cd C:\Project_ERP
python simple_api.py
```
**URL**: http://localhost:8001  
**API Docs**: http://localhost:8001/docs

### 2. Start Mobile App
```powershell
cd C:\Project_ERP\mobile
npx expo start --web
```
**URL**: http://localhost:19006

### 3. Quick Test
```powershell
cd C:\Project_ERP
.\quick-test.ps1
```

## 🔐 DEFAULT LOGIN
- **Username**: admin
- **Password**: admin123

## 📱 MOBILE APP FEATURES
1. **Dashboard** - Overview statistik
2. **Customer Check-in** - Scan QR code
3. **Payment Collection** - Process pembayaran
4. **Reports** - Laporan keuangan
5. **Fraud Detection** - Alert otomatis

## 🛠️ PRODUCTION DEPLOYMENT

### Quick Deploy
```powershell
cd C:\Project_ERP
.\deploy-production.ps1
```

### Manual Deploy
```powershell
# 1. Build production
.\build-production.ps1

# 2. Start with Docker
docker-compose -f docker-compose.production.yml up -d

# 3. Monitor system
.\monitor-system.ps1
```

## 📊 MONITORING

### System Health
```powershell
# Quick system check
.\quick-test.ps1

# Full system test
.\test-system.ps1 -TestSuite all

# Start monitoring
.\monitor-system.ps1 -IntervalSeconds 60
```

### Backup
```powershell
# Full backup
.\backup-system.ps1 -BackupType full

# Database only
.\backup-system.ps1 -BackupType database
```

## 🆘 TROUBLESHOOTING

### Backend Not Starting
```powershell
# Check if port 8001 is used
netstat -an | findstr 8001

# Kill existing process
taskkill /F /IM python.exe

# Restart
python simple_api.py
```

### Mobile App Not Loading
```powershell
# Clear cache and restart
cd mobile
npm install --legacy-peer-deps
npx expo start --web --clear
```

### Docker Issues
```powershell
# Reset Docker
docker-compose down
docker system prune -f
docker-compose up -d
```

## 📚 DOCUMENTATION
- **USER_MANUAL.md** - Panduan pengguna
- **ADMIN_GUIDE.md** - Panduan administrator  
- **DEPLOYMENT_CHECKLIST.md** - Checklist deployment
- **TESTING_PLAN.md** - Panduan testing
- **FINAL_DEPLOYMENT_STATUS.md** - Status akhir

## 🔗 IMPORTANT URLs

### Development
- Backend API: http://localhost:8001
- API Documentation: http://localhost:8001/docs
- Mobile App: http://localhost:19006

### Production (Configure your domain)
- Web App: https://app.gajahnusa.com
- API: https://api.gajahnusa.com
- Docs: https://api.gajahnusa.com/docs

---
**System Ready!** 🎉  
*GAJAH NUSA ERP v1.0.0*
