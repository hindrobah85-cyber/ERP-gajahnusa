#!/bin/bash
# Start Backend Server
echo "Starting GAJAH NUSA ERP Backend..."
cd "$(dirname "$0")"
source .venv/bin/activate
python start_backend.py
