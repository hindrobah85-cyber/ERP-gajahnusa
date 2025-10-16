# 📦 MIGRATION TO USB DRIVE - PREPARATION CHECKLIST

## 🎯 Tujuan
Memindahkan seluruh Project_ERP ke USB Drive E:\ dengan environment lengkap dan siap dijalankan.

## ✅ Pre-Migration Checklist

### 1. Verifikasi Git Status
- [x] Semua file sudah di-commit
- [x] Semua perubahan sudah di-push ke GitHub
- [x] Working directory clean

### 2. File yang HARUS Disertakan
- [x] Source code (packages/)
- [x] Configuration files (.env, config files)
- [x] Documentation (README files)
- [x] Startup scripts (.bat files)
- [x] Database files (.db files)
- [x] Git repository (.git/)

### 3. File yang TIDAK Perlu Disertakan (akan di-generate ulang)
- [ ] node_modules/ (semua team)
- [ ] .next/ (Next.js build cache)
- [ ] dist/ (build output)
- [ ] __pycache__/ (Python cache)
- [ ] venv/ (Python virtual environment)
- [ ] .vite/ (Vite cache)

### 4. Environment yang Perlu Disiapkan di USB
- [ ] Node.js (portable atau sudah terinstall di PC target)
- [ ] Python (portable atau sudah terinstall di PC target)
- [ ] Go (portable atau sudah terinstall di PC target)
- [ ] PostgreSQL (untuk Team 6)
- [ ] Redis (untuk Team 2)

## 📋 Migration Steps

### Step 1: Bersihkan File Tidak Perlu
```bash
# Script akan membersihkan otomatis:
# - node_modules/
# - Python cache
# - Build artifacts
```

### Step 2: Verifikasi Struktur
```bash
# Pastikan struktur lengkap:
Project_ERP/
├── packages/ (8 teams)
├── start-all-teams.bat
├── README_COMPLETE.md
├── SYSTEM_DOCUMENTATION.md
└── .git/
```

### Step 3: Copy ke USB
```bash
# Menggunakan robocopy untuk copy yang aman
robocopy D:\Project_ERP E:\Project_ERP /MIR /XD node_modules .next dist __pycache__ venv
```

### Step 4: Setup di USB
```bash
# Install dependencies di lokasi baru
cd E:\Project_ERP
.\setup-after-migration.bat
```

## 🔧 Post-Migration Setup Script
File: `setup-after-migration.bat`
- Install semua npm dependencies
- Setup Python virtual environments
- Verify Go modules
- Test database connections

## ⚠️ IMPORTANT NOTES

1. **USB Drive Requirements**:
   - Minimum 2GB free space
   - Format: NTFS (recommended)
   - USB 3.0+ (untuk performa optimal)

2. **Software Requirements di PC Target**:
   - Node.js 18+
   - Python 3.11+
   - Go 1.21+
   - Git

3. **Database Files**:
   - SQLite databases akan di-copy
   - PostgreSQL perlu setup manual (Team 6)
   - Redis perlu running service

4. **Startup Order**:
   - Jalankan dari E:\Project_ERP
   - Gunakan `.\start-all-teams.bat`

## 📝 Verification Checklist (After Migration)

- [ ] Git repository intact
- [ ] All 8 team folders present
- [ ] Configuration files copied
- [ ] Dependencies installed
- [ ] Test startup script
- [ ] Verify database connections
- [ ] Test individual teams

---

**Created**: October 16, 2025
**Status**: Ready for migration
