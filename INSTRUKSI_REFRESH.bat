@echo off
color 0A
echo.
echo ========================================
echo   REFRESH BROWSER - INSTRUKSI
echo ========================================
echo.
echo File sales-mobile-final.html SUDAH DIUPDATE!
echo.
echo PERUBAHAN YANG DILAKUKAN:
echo [1] Button "Lunas/Titip" DIHAPUS dari form
echo [2] Sistem OTOMATIS detect overpayment
echo [3] Validasi overpayment DINONAKTIFKAN
echo [4] Overpayment DIPERBOLEHKAN sekarang
echo.
echo ========================================
echo   CARA MELIHAT PERUBAHAN:
echo ========================================
echo.
echo PILIHAN 1: Hard Refresh (RECOMMENDED)
echo    - Tekan: Ctrl + Shift + R
echo    - Atau: Ctrl + F5
echo.
echo PILIHAN 2: Clear Cache
echo    - Tekan: Ctrl + Shift + Delete
echo    - Pilih: "Cached images and files"
echo    - Clear data
echo    - Refresh browser (F5)
echo.
echo PILIHAN 3: Tutup dan Buka Ulang
echo    - Tutup tab browser
echo    - Buka file lagi: sales-mobile-final.html
echo.
echo ========================================
echo   YANG HARUS BERUBAH:
echo ========================================
echo.
echo [SEBELUM] Form ada button: "Lunas" dan "Titip"
echo [SESUDAH] Form TIDAK ADA button tersebut!
echo.
echo Form sekarang hanya ada:
echo  - Jumlah Pembayaran (input angka)
echo  - Metode Pembayaran (Cash/Transfer/dll)
echo  - Proses Pembayaran (button hijau)
echo.
echo SISTEM OTOMATIS:
echo  - Bayar LEBIH = Overpayment (alokasi ke next)
echo  - Bayar PAS = Lunas
echo  - Bayar KURANG = Cicilan
echo.
echo ========================================
echo.
pause
