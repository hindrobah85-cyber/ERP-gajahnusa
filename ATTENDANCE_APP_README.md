# APLIKASI ABSENSI - GAJAH NUSA ERP
## Setup & Cara Kerja

---

## ✅ YANG SUDAH DIBUAT

### 1. Attendance Microservice API (Port 8002)
- Terpisah dari ERP utama
- Database tetap sama (shared)
- Fokus pada absensi & sync data

### 2. Mobile Web App dengan Offline-First
- Local storage untuk data offline
- Sync otomatis saat online
- Queue system untuk action offline

### 3. Data Filtering by Area
- Hanya download customer di area salesman
- Hanya download product dengan stock
- Data lebih ringan & cepat

---

## 🚀 CARA MENJALANKAN

### 1. Start Attendance Service
```
python attendance_service.py
```
- Jalan di port 8002
- API Docs: http://localhost:8002/docs

### 2. Buka Aplikasi
```
http://localhost:3000/attendance-app.html
```

---

## 📱 FITUR APLIKASI

### ✅ Offline-First Support
- Data tersimpan di localStorage browser
- Bisa cek stock tanpa internet
- Bisa lihat customer tanpa internet
- Action tersimpan, sync otomatis saat online

### ✅ Check In/Out
- Check-in ke customer
- Check-out setelah kunjungan
- GPS location tracking
- Notes per kunjungan

### ✅ Sync Strategy
- **Morning Sync:** Download data customer & stock
- **Evening Sync:** Upload semua action offline
- **Auto Sync:** Otomatis saat kembali online
- **Manual Sync:** Tombol sync kapan saja

### ✅ Data Management
- Customer filtered by area salesman
- Stock product real-time
- Offline queue tracking
- Sync status indicator

---

## 🔧 API ENDPOINTS

### Attendance
- `POST /api/attendance/checkin` - Check-in
- `POST /api/attendance/checkout` - Check-out
- `GET /api/attendance/history/{salesman_id}` - History

### Sync
- `POST /api/sync/download` - Download data (filtered by area)
- `POST /api/sync/upload` - Upload offline actions

### Data
- `GET /api/data/customers/{salesman_id}` - Get customers
- `GET /api/data/products` - Get products

---

## 💾 OFFLINE STORAGE

### Local Storage Structure:
```javascript
{
  "customers": [...],      // Customer list by area
  "products": [...],       // Product stock
  "offlineQueue": [...],   // Pending actions
  "lastSync": "timestamp", // Last sync time
  "currentVisit": "id"     // Active visit
}
```

### Data Tersimpan:
- ✅ Customers (filtered by area)
- ✅ Products (with stock info)
- ✅ Offline actions queue
- ✅ Current visit status

---

## 🌐 SOLUSI INTERNET LEMAH

### 1. **Offline Mode Penuh**
   - Aplikasi tetap berfungsi tanpa internet
   - Data di-cache di browser
   - Action disimpan, dikirim nanti

### 2. **Data Minimal**
   - Hanya download customer area salesman
   - Hanya download product dengan stock
   - Size data 10x lebih kecil

### 3. **Smart Sync**
   - Sync pagi: download data baru
   - Sync malam: upload semua action
   - Auto-sync saat online kembali

### 4. **Queue System**
   - Action offline masuk queue
   - Dikirim otomatis saat online
   - Retry jika gagal

---

## 📊 STATUS APLIKASI

✅ Microservice API - Running on port 8002
✅ Mobile Web App - Offline-first ready
✅ Local Storage - Implemented
✅ Sync Strategy - Morning/Evening/Auto
✅ Data Filtering - By area salesman
✅ Queue System - For offline actions

---

## 🎯 NEXT STEPS (Optional)

1. **GPS Verification** - Validasi lokasi real
2. **Photo Upload** - Foto check-in
3. **Native Mobile** - React Native / Flutter
4. **Push Notifications** - Alert & reminders
5. **Reporting** - Dashboard kunjungan

---

## 📞 AKSES

**Attendance API:** http://localhost:8002
**API Documentation:** http://localhost:8002/docs
**Mobile App:** http://localhost:3000/attendance-app.html
**Main ERP:** http://localhost:8000

---

**Status:** ✅ SELESAI & SIAP PAKAI
**Database:** Shared dengan ERP (SQLite)
**Offline Support:** Full offline-first architecture
