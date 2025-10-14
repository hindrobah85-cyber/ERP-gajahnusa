# 🌐 GAJAH NUSA ERP - Chrome Demo Instructions

## ✅ Status Server
- ✅ HTTP Server: **Running** on `http://localhost:8080`
- ✅ Registration API: **Running** on `http://localhost:8002`

## 🔧 Instruksi Menggunakan Google Chrome

### 📋 Langkah-langkah:
1. **Buka Google Chrome** (jangan gunakan Microsoft Edge)
2. **Copy & Paste** URL berikut ke address bar Chrome
3. **Tekan Enter** untuk mengakses aplikasi

---

## 🚀 Demo URLs untuk Google Chrome

### 1. 📝 **Registration Form (Fitur Utama Baru)**
```
http://localhost:8080/register.html
```

**Fitur Baru yang Bisa Ditest:**
- 📁📷 **KTP Photo**: Pilih "Upload File" atau "Take Photo"
- 🧠 **AI Face Recognition**: Machine learning dengan 3 detik processing
- 📞 **Area Phone**: Muncul otomatis untuk sales/supervisor/manager
- ✅ **Validasi Lengkap**: Semua field wajib diisi

---

### 2. 👥 **Employee Management**
```
http://localhost:8080/employee_management.html
```

**Test Role-based Deletion:**
- Set role sebagai **Admin/Owner** → Delete button aktif
- Set role lain → Delete button disabled dengan pesan error

---

### 3. 🏢 **Admin Dashboard (Updated)**
```
http://localhost:8080/web_admin_dashboard.html
```

**Perubahan:**
- Tagline baru: **"AI Cerdas dan Canggih"** (bukan "Anti-Fraud")

---

### 4. 📚 **API Documentation**
```
http://localhost:8002/docs
```

**Test API Endpoints:**
- Employee ID Preview
- Registration dengan ML data
- Role-based deletion

---

## 🧪 **Testing Scenario untuk Chrome**

### Test 1: KTP Photo Options
1. Buka registration form di Chrome
2. Scroll ke bagian "KTP Photo"
3. Test kedua opsi:
   - Klik **"📁 Upload File"** → Pilih gambar KTP
   - Klik **"📷 Take Photo"** → Allow camera → Capture

### Test 2: AI Face Recognition
1. Scroll ke bagian "Face Recognition Setup"
2. Klik **"🧠 Start AI Face Learning"**
3. Allow camera permissions di Chrome
4. Klik **"📸 Capture & Analyze"**
5. Lihat proses ML (3 detik dengan spinner)
6. Konfirmasi **"✅ Face Recognition Complete"**

### Test 3: Area Phone Logic
1. Di form registration, pilih role:
   - **Sales/Supervisor/Manager** → Area Phone field muncul
   - **Driver/Gudang/Admin** → Area Phone field hilang

### Test 4: Form Validation
1. Coba submit form kosong → Error messages
2. Isi semua field bertanda **"*"**
3. Pastikan KTP photo dan face recognition complete
4. Submit → Dapat Employee ID otomatis

---

## ⚠️ **Penting untuk Chrome**

### Camera Permissions:
- Chrome akan minta permission untuk camera
- **Klik "Allow"** untuk fitur face recognition
- **Klik "Allow"** untuk KTP photo capture

### Best Practices:
- Gunakan **Google Chrome** untuk kompatibilitas terbaik
- Pastikan camera dan microphone permissions enabled
- Refresh halaman jika ada error loading

---

## 🎯 **Quick Access Links**

Copy dan paste ke Chrome address bar:

**Main Registration:**
```
http://localhost:8080/register.html
```

**Employee Management:**
```
http://localhost:8080/employee_management.html
```

**Chrome Demo Guide:**
```
http://localhost:8080/chrome_demo_guide.html
```

---

## 📊 **Semua Fitur Terimplementasi**

✅ **KTP Photo**: Upload file OR camera capture  
✅ **AI Face Recognition**: Machine learning dengan landmark detection  
✅ **Area Phone**: Role-based visibility  
✅ **Tagline Update**: "AI Cerdas dan Canggih"  
✅ **Role-based Deletion**: Admin/Owner only  
✅ **Form Validation**: Comprehensive dengan error messages  
✅ **Employee ID Auto-generation**: Role-based prefixes  

**Semua siap untuk demo di Google Chrome!** 🚀
