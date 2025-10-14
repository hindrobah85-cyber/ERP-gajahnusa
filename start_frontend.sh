#!/bin/bash
# Start Frontend Server
echo "Starting GAJAH NUSA ERP Frontend..."
cd "$(dirname "$0")/frontend"
npm run dev
