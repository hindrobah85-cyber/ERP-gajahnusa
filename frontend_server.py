#!/usr/bin/env python3
"""
Static File Server untuk Frontend ERP
"""

import http.server
import socketserver
import webbrowser
import os
from pathlib import Path

def start_frontend_server():
    """Start static file server untuk frontend"""
    PORT = 3000
    DIRECTORY = Path(__file__).parent
    
    class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(DIRECTORY), **kwargs)
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🌐 Frontend Server berjalan di: http://localhost:{PORT}")
        print(f"📁 Serving directory: {DIRECTORY}")
        print("📄 File yang tersedia:")
        
        # List HTML files
        html_files = list(DIRECTORY.glob("*.html"))
        for html_file in html_files[:10]:  # Show first 10 files
            print(f"   - {html_file.name}")
        
        print(f"\n✅ Server frontend berhasil dimulai!")
        print("🛑 Tekan Ctrl+C untuk menghentikan server\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server frontend dihentikan.")

if __name__ == "__main__":
    start_frontend_server()