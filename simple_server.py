#!/usr/bin/env python3
"""
Simple ERP Server dengan FastAPI
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
from pathlib import Path

# Inisialisasi FastAPI
app = FastAPI(
    title="GAJAH NUSA ERP System",
    description="Sistem ERP dengan Anti-Fraud Detection",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
current_dir = Path(__file__).parent
app.mount("/static", StaticFiles(directory=str(current_dir / "assets")), name="static")

@app.get("/", response_class=HTMLResponse)
async def root():
    """Halaman utama"""
    return """
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GAJAH NUSA ERP System</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: white;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                text-align: center;
            }
            .header {
                margin-bottom: 50px;
            }
            h1 {
                font-size: 3em;
                margin-bottom: 20px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .subtitle {
                font-size: 1.2em;
                opacity: 0.9;
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 30px;
                margin: 50px 0;
            }
            .feature-card {
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                padding: 30px;
                border-radius: 15px;
                border: 1px solid rgba(255,255,255,0.2);
                transition: transform 0.3s ease;
            }
            .feature-card:hover {
                transform: translateY(-5px);
            }
            .feature-card h3 {
                color: #ffeb3b;
                margin-bottom: 15px;
                font-size: 1.4em;
            }
            .links {
                margin-top: 50px;
            }
            .btn {
                display: inline-block;
                padding: 15px 30px;
                margin: 10px;
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 25px;
                color: white;
                text-decoration: none;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            .btn:hover {
                background: rgba(255,255,255,0.3);
                transform: scale(1.05);
            }
            .status {
                margin-top: 30px;
                padding: 15px;
                background: rgba(76, 175, 80, 0.2);
                border-radius: 10px;
                border-left: 4px solid #4caf50;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🐘 GAJAH NUSA ERP</h1>
                <p class="subtitle">Sistem ERP Terintegrasi dengan Anti-Fraud Detection & Machine Learning</p>
            </div>
            
            <div class="features">
                <div class="feature-card">
                    <h3>📊 Dashboard Admin</h3>
                    <p>Kelola seluruh operasional bisnis dengan dashboard yang komprehensif dan real-time monitoring.</p>
                    <a href="/admin" class="btn">Buka Dashboard</a>
                </div>
                
                <div class="feature-card">
                    <h3>👥 Manajemen Karyawan</h3>
                    <p>Sistem registrasi, autentikasi, dan manajemen peran karyawan yang aman dan terstruktur.</p>
                    <a href="/employee" class="btn">Kelola Karyawan</a>
                </div>
                
                <div class="feature-card">
                    <h3>🛒 Sistem Pemesanan</h3>
                    <p>Proses order management yang efisien dengan tracking real-time dan batch payment processing.</p>
                    <a href="/orders" class="btn">Kelola Pesanan</a>
                </div>
                
                <div class="feature-card">
                    <h3>🔐 Anti-Fraud System</h3>
                    <p>Deteksi fraud otomatis dengan machine learning untuk melindungi transaksi dan data bisnis.</p>
                    <a href="/fraud-detection" class="btn">Monitor Fraud</a>
                </div>
                
                <div class="feature-card">
                    <h3>📱 Mobile App</h3>
                    <p>Akses sistem ERP melalui aplikasi mobile untuk sales team dan manajemen lapangan.</p>
                    <a href="/mobile" class="btn">Mobile App</a>
                </div>
                
                <div class="feature-card">
                    <h3>🤖 ML Engine</h3>
                    <p>Engine machine learning untuk prediksi sales, analisis pattern, dan optimasi bisnis.</p>
                    <a href="/ml-engine" class="btn">ML Analytics</a>
                </div>
            </div>
            
            <div class="status">
                <h3>✅ System Status: ONLINE</h3>
                <p>Backend API: <strong>http://localhost:8001</strong></p>
                <p>Frontend: <strong>http://localhost:3000</strong></p>
                <p>Database: <strong>SQLite (Development)</strong></p>
            </div>
            
            <div class="links">
                <a href="/docs" class="btn">📚 API Documentation</a>
                <a href="/admin" class="btn">🎛️ Admin Panel</a>
                <a href="/test" class="btn">🧪 Test Interface</a>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/docs-redirect")
async def docs_redirect():
    """Redirect to API docs"""
    return {"message": "API Documentation", "url": "/docs"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "GAJAH NUSA ERP",
        "version": "1.0.0",
        "timestamp": "2024-09-12"
    }

@app.get("/admin")
async def admin_page():
    """Redirect to admin dashboard"""
    try:
        admin_file = Path(__file__).parent / "web_admin_dashboard.html"
        if admin_file.exists():
            return FileResponse(str(admin_file))
        else:
            return HTMLResponse("""
            <h1>Admin Dashboard</h1>
            <p>Admin dashboard sedang dalam pengembangan.</p>
            <a href="/">Kembali ke Home</a>
            """)
    except:
        return {"message": "Admin dashboard", "status": "under development"}

@app.get("/employee")
async def employee_page():
    """Employee management page"""
    try:
        emp_file = Path(__file__).parent / "employee_management.html"
        if emp_file.exists():
            return FileResponse(str(emp_file))
        else:
            return HTMLResponse("""
            <h1>Employee Management</h1>
            <p>Halaman manajemen karyawan sedang dalam pengembangan.</p>
            <a href="/">Kembali ke Home</a>
            """)
    except:
        return {"message": "Employee management", "status": "under development"}

@app.get("/mobile")
async def mobile_page():
    """Mobile app page for sales team"""
    try:
        mobile_file = Path(__file__).parent / "sales-mobile-complete.html"
        if mobile_file.exists():
            return FileResponse(str(mobile_file))
        else:
            return HTMLResponse("""
            <h1>Mobile App for Sales</h1>
            <p>Aplikasi mobile untuk salesman sedang dalam pengembangan.</p>
            <a href="/">Kembali ke Home</a>
            """)
    except:
        return {"message": "Mobile app for sales", "status": "under development"}

@app.get("/sales")
async def sales_mobile():
    """Sales mobile app - alternative endpoint"""
    try:
        mobile_file = Path(__file__).parent / "sales-mobile-complete.html"
        if mobile_file.exists():
            return FileResponse(str(mobile_file))
        else:
            return FileResponse(str(Path(__file__).parent / "sales-mobile-final.html"))
    except:
        return {"message": "Sales mobile app", "status": "available"}

@app.get("/salesman")
async def salesman_app():
    """Dedicated salesman mobile application"""
    try:
        mobile_file = Path(__file__).parent / "sales-mobile-complete.html"
        if mobile_file.exists():
            return FileResponse(str(mobile_file))
        else:
            return HTMLResponse("""
            <h1>Salesman Mobile App</h1>
            <p>Aplikasi khusus untuk salesman GAJAH NUSA ERP.</p>
            <a href="/">Kembali ke Home</a>
            """)
    except:
        return {"message": "Salesman mobile app", "status": "loading"}

@app.get("/orders")
async def orders_page():
    """Orders management page"""
    try:
        orders_file = Path(__file__).parent / "demo-order-management.html"
        if orders_file.exists():
            return FileResponse(str(orders_file))
        else:
            return HTMLResponse("""
            <h1>Order Management</h1>
            <p>Sistem pemesanan sedang dalam pengembangan.</p>
            <a href="/">Kembali ke Home</a>
            """)
    except:
        return {"message": "Order management", "status": "under development"}

@app.get("/test")
async def test_page():
    """Test interface page"""
    try:
        test_file = Path(__file__).parent / "test.html"
        if test_file.exists():
            return FileResponse(str(test_file))
        else:
            return HTMLResponse("""
            <h1>Test Interface</h1>
            <p>Interface testing sedang dalam pengembangan.</p>
            <a href="/">Kembali ke Home</a>
            """)
    except:
        return {"message": "Test interface", "status": "under development"}

@app.get("/ml-engine")
async def ml_engine_page():
    """ML Engine Dashboard"""
    try:
        ml_file = Path(__file__).parent / "ml-dashboard.html"
        if ml_file.exists():
            return FileResponse(str(ml_file))
        else:
            return HTMLResponse("""
            <h1>ML Engine Dashboard</h1>
            <p>Machine Learning Engine sedang dalam pengembangan.</p>
            <a href="/">Kembali ke Home</a>
            """)
    except:
        return {"message": "ML Engine", "status": "active"}

@app.get("/fraud-detection")
async def fraud_detection_page():
    """Fraud Detection Dashboard"""
    try:
        return HTMLResponse("""
        <h1>🔐 Fraud Detection System</h1>
        <p>Real-time fraud detection dan monitoring.</p>
        <p><a href="/ml-engine">Lihat ML Engine Dashboard untuk detail</a></p>
        <a href="/">Kembali ke Home</a>
        """)
    except:
        return {"message": "Fraud Detection", "status": "monitoring"}

if __name__ == "__main__":
    print("🚀 Starting GAJAH NUSA ERP Server...")
    print("📍 Server akan berjalan di: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🎛️ Admin Panel: http://localhost:8000/admin")
    print("📱 Mobile App: http://localhost:8000/mobile")
    print("\n✅ Server berhasil dimulai! Tekan Ctrl+C untuk menghentikan.\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )