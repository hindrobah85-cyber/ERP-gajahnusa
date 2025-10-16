# 🎯 QUICK START - MIGRATION TO USB E:\

## ⚡ SUPER SIMPLE - 3 STEPS ONLY!

### 📍 STEP 1: VERIFY (2 minutes)
```bash
cd D:\Project_ERP
.\verify-before-migration.bat
```
**Cek:** USB E:\ ada? Software lengkap? ✅

---

### 📍 STEP 2: (OPTIONAL) CLEANUP (3 minutes)
```bash
.\cleanup-before-migration.bat
```
**Benefit:** Ukuran kecil (100MB vs 1GB)  
**Safe:** File akan di-generate ulang nanti

---

### 📍 STEP 3: COPY TO USB (5 minutes)
```bash
.\copy-to-usb.bat
```
**Result:** Semua file di E:\Project_ERP ✅

---

## 🎉 DONE! Now Setup on USB

```bash
E:
cd E:\Project_ERP
.\setup-after-migration.bat
```
**Time:** 10-15 minutes (install dependencies)

---

## 🚀 RUN FROM USB

```bash
E:
cd E:\Project_ERP
.\start-all-teams.bat
```

**All 8 teams will start!** 🎊

---

## 🔍 WHAT GETS COPIED?

### ✅ YES (AKAN DI-COPY)
- ✅ Source code (packages/)
- ✅ Configuration files
- ✅ Database files (.db)
- ✅ Documentation
- ✅ Git repository (.git/)
- ✅ Startup scripts

### ❌ NO (TIDAK DI-COPY - akan di-generate)
- ❌ node_modules/
- ❌ __pycache__/
- ❌ venv/
- ❌ .next/, dist/, build/
- ❌ Log files

---

## 📊 SIZE COMPARISON

| Scenario | Size |
|----------|------|
| **With cleanup** | ~100-200 MB |
| **Without cleanup** | ~1-2 GB |
| **After setup on USB** | ~1-2 GB |

---

## ⚠️ REQUIREMENTS

### On Current PC (D:\)
- ✅ Git (untuk verify)
- ✅ USB Drive E:\ (minimum 2GB)

### On Target PC (where USB will run)
- ✅ Node.js 18+
- ✅ Python 3.11+
- ✅ Go 1.21+
- ✅ PostgreSQL (for Team 6)
- ✅ Redis (for Team 2)

---

## 🎯 COMPLETE WORKFLOW

```
D:\Project_ERP
    │
    ├─► verify-before-migration.bat    (Check everything)
    │
    ├─► cleanup-before-migration.bat   (Optional: reduce size)
    │
    ├─► copy-to-usb.bat               (Copy to E:\)
    │
    └─► DONE! ✅

E:\Project_ERP
    │
    ├─► setup-after-migration.bat      (Install dependencies)
    │
    ├─► start-all-teams.bat           (Run all teams)
    │
    └─► RUNNING! 🚀
```

---

## 🆘 TROUBLESHOOTING

### USB not E:\?
1. Insert USB
2. Disk Management → Change drive letter to E:\
3. Run scripts again

### Copy failed?
- Check USB free space (min 2GB)
- Check USB not write-protected
- Try different USB port (USB 3.0 better)

### Setup failed?
- Check internet connection (for npm/pip)
- Run setup again (script is safe to re-run)
- Check software installed (Node, Python, Go)

---

## 📝 FILES CREATED FOR YOU

1. **verify-before-migration.bat** - Pre-flight check
2. **cleanup-before-migration.bat** - Remove temp files
3. **copy-to-usb.bat** - Copy to USB E:\
4. **setup-after-migration.bat** - Setup on USB
5. **MIGRATION_GUIDE.md** - Detailed guide
6. **MIGRATION_CHECKLIST.md** - Full checklist

---

## ✅ VERIFICATION

After copy, check E:\ has:
- ✅ E:\Project_ERP\packages\ (8 teams)
- ✅ E:\Project_ERP\start-all-teams.bat
- ✅ E:\Project_ERP\.git\
- ✅ E:\Project_ERP\README_COMPLETE.md

---

## 🎉 SUCCESS CRITERIA

You're done when:
1. ✅ Files copied to E:\Project_ERP
2. ✅ setup-after-migration.bat completed
3. ✅ start-all-teams.bat launches all 8 teams
4. ✅ Can access http://localhost:3008 (Analytics)

---

**ESTIMATED TOTAL TIME:** 20-30 minutes
**DIFFICULTY:** ⭐ Easy (automated scripts)
**SAFETY:** ✅ Original files on D:\ untouched

---

**Ready? Start with Step 1!** 🚀

```bash
cd D:\Project_ERP
.\verify-before-migration.bat
```
