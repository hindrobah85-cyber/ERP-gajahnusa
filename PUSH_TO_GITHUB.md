# 🚀 Push ERP Gajah Nusa ke GitHub

## ⚠️ Langkah-langkah Push Manual

### 1️⃣ Buat Repository di GitHub (Jika belum ada)

1. Buka browser: https://github.com/new
2. **Repository name**: `ERP_gajahnusa`
3. **Description**: `Gajah Nusa ERP System - Multi-team Integration Project`
4. **Visibility**: Pilih **Public** atau **Private**
5. ⚠️ **JANGAN centang apapun** (no README, no .gitignore, no license)
6. Click **"Create repository"**

### 2️⃣ Setup Git Credentials (Jika error authentication)

**Option A - Personal Access Token (Recommended):**

1. Buka: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Note: `ERP_gajahnusa_push`
4. Select scope: ✅ **repo** (full control)
5. Click **"Generate token"**
6. **COPY TOKEN** (hanya muncul sekali!)

**Option B - GitHub Desktop:**

1. Download GitHub Desktop: https://desktop.github.com/
2. Login dengan akun GitHub
3. File → Add Local Repository → Browse ke `D:\Project_ERP`
4. Push via GUI

### 3️⃣ Push via Command Line

```powershell
cd D:\Project_ERP

# Cek status
git status

# Set remote (gunakan token jika perlu)
git remote remove origin
git remote add origin https://github.com/hindro150/ERP_gajahnusa.git

# Push dengan credentials
git push -u origin main
```

**Jika minta password**, gunakan **Personal Access Token** (bukan password GitHub biasa).

**Username**: hindro150
**Password**: [Token yang di-copy dari step 2A]

### 4️⃣ Alternative - Push via HTTPS dengan Token di URL

```powershell
cd D:\Project_ERP
git remote set-url origin https://YOUR_TOKEN@github.com/hindro150/ERP_gajahnusa.git
git push -u origin main
```

Ganti `YOUR_TOKEN` dengan token dari step 2A.

### 5️⃣ Alternative - SSH (Jika sudah setup SSH key)

```powershell
cd D:\Project_ERP
git remote set-url origin git@github.com:hindro150/ERP_gajahnusa.git
git push -u origin main
```

---

## 📦 Isi yang Akan Di-Push

Commit terakhir berisi:

✅ **Team 4** - HR Management System (Vue.js + FastAPI)
- 14 complete views
- FastAPI backend with 8 endpoints
- Employee, Attendance, Leave, Payroll, Performance, Reports

✅ **Team 5** - E-commerce Platform (Next.js + FastAPI)
- 6 pages: Homepage, Products, Product Detail, Cart, Checkout, Order Tracking
- FastAPI backend with product, order, payment APIs
- Zustand state management

✅ **Team 6** - Retail POS System (React + Express + PostgreSQL)
- 8 pages: Store Selector, POS Cashier, Dashboard, Warehouse, Central Warehouse, Transactions, Employees, Reports
- Express.js backend with 8 route modules
- PostgreSQL with 10 tables
- Multi-store architecture

**Total**: 135 files changed, 58,430+ lines added! 🎉

---

## 🐛 Troubleshooting

### Error: "Repository not found"
➡️ Repository belum dibuat atau tidak ada akses. Ikuti step 1.

### Error: "Authentication failed"
➡️ Password salah. Gunakan Personal Access Token (step 2A), bukan password biasa.

### Error: "Permission denied"
➡️ Tidak ada write access. Pastikan repository milik Anda atau Anda punya collaborator access.

### Error: "failed to push some refs"
➡️ Branch sudah ada dengan history berbeda. Gunakan:
```powershell
git push -u origin main --force
```
⚠️ **WARNING**: `--force` akan overwrite remote repository!

---

## ✅ Verify Push Berhasil

Setelah push berhasil, cek:

1. Buka: https://github.com/hindro150/ERP_gajahnusa
2. Pastikan terlihat:
   - `packages/` folder dengan team4, team5, team6
   - Commit message: "Add Team 4, 5, 6: HR System..."
   - 135 files changed

---

## 🎯 Quick Command Summary

```powershell
# Full push sequence
cd D:\Project_ERP
git remote set-url origin https://github.com/hindro150/ERP_gajahnusa.git
git push -u origin main
```

Jika error, gunakan token:
```powershell
git remote set-url origin https://YOUR_PERSONAL_ACCESS_TOKEN@github.com/hindro150/ERP_gajahnusa.git
git push -u origin main
```

---

**Need Help?** 
- GitHub Docs: https://docs.github.com/en/authentication
- Personal Access Tokens: https://github.com/settings/tokens
