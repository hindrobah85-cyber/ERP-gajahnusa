@echo off
echo ============================================
echo  GAJAH NUSA ERP SYSTEM - ALL TEAMS STARTUP
echo  Starting All 8 Teams Simultaneously...
echo ============================================
echo.
echo This will launch all teams in separate windows:
echo  Team 1: Sales Mobile (React Native) - Port 8081
echo  Team 2: Logistics Backend (Node.js + Redis) - Ports 3002/8002
echo  Team 3: Finance Web (React) - Port 3003
echo  Team 4: HR System (Vue.js + FastAPI) - Ports 3004/8004
echo  Team 5: E-commerce (Next.js + FastAPI) - Ports 3005/8005
echo  Team 6: Retail POS (React + Express + PostgreSQL) - Ports 3006/8006
echo  Team 7: Customer Service CRM (Svelte + Go) - Ports 3007/8007
echo  Team 8: Analytics ^& BI (Next.js + Python) - Ports 3008/8008
echo.
echo ============================================
pause

echo.
echo [STARTING ALL TEAMS...]
echo.

REM Team 1 - Sales Mobile
echo [1/8] Starting Team 1 - Sales Mobile...
cd packages\team1-sales-mobile
start "Team 1 - Sales Mobile" cmd /k "npm start"
cd ..\..
timeout /t 2 /nobreak >nul

REM Team 2 - Logistics Backend
echo [2/8] Starting Team 2 - Logistics Backend...
cd packages\team2-logistics
start "Team 2 Backend - Port 8002" cmd /k "node backend/server.js"
timeout /t 2 /nobreak >nul
start "Team 2 Frontend - Port 3002" cmd /k "npm start"
cd ..\..
timeout /t 2 /nobreak >nul

REM Team 3 - Finance Web
echo [3/8] Starting Team 3 - Finance Web...
cd packages\team3-finance
start "Team 3 - Finance Web - Port 3003" cmd /k "npm start"
cd ..\..
timeout /t 2 /nobreak >nul

REM Team 4 - HR System
echo [4/8] Starting Team 4 - HR System...
cd packages\team4-hr
start "Team 4 Backend - Port 8004" cmd /k "cd backend && python -m uvicorn main:app --reload --port 8004"
timeout /t 3 /nobreak >nul
start "Team 4 Frontend - Port 3004" cmd /k "npm run dev"
cd ..\..
timeout /t 2 /nobreak >nul

REM Team 5 - E-commerce
echo [5/8] Starting Team 5 - E-commerce...
cd packages\team5-ecommerce
start "Team 5 Backend - Port 8005" cmd /k "cd backend && python -m uvicorn main:app --reload --port 8005"
timeout /t 3 /nobreak >nul
start "Team 5 Frontend - Port 3005" cmd /k "npm run dev"
cd ..\..
timeout /t 2 /nobreak >nul

REM Team 6 - Retail POS
echo [6/8] Starting Team 6 - Retail POS...
cd packages\team6-retail-pos
start "Team 6 Backend - Port 8006" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul
start "Team 6 Frontend - Port 3006" cmd /k "npm run dev"
cd ..\..
timeout /t 2 /nobreak >nul

REM Team 7 - Customer Service CRM
echo [7/8] Starting Team 7 - Customer Service CRM...
cd packages\team7-customer-service
start "Team 7 Backend - Port 8007" cmd /k "cd backend && go run main.go"
timeout /t 3 /nobreak >nul
start "Team 7 Frontend - Port 3007" cmd /k "npm run dev"
cd ..\..
timeout /t 2 /nobreak >nul

REM Team 8 - Analytics & BI
echo [8/8] Starting Team 8 - Analytics ^& BI...
cd packages\team8-analytics
start "Team 8 Backend - Port 8008" cmd /k "cd backend && venv\Scripts\activate && python main.py"
timeout /t 3 /nobreak >nul
start "Team 8 Frontend - Port 3008" cmd /k "npm run dev"
cd ..\..

echo.
echo ============================================
echo  ALL TEAMS STARTED SUCCESSFULLY!
echo ============================================
echo.
echo  FRONTEND ACCESS:
echo  - Sales Mobile:     http://localhost:8081
echo  - Logistics:        http://localhost:3002
echo  - Finance:          http://localhost:3003
echo  - HR System:        http://localhost:3004
echo  - E-commerce:       http://localhost:3005
echo  - Retail POS:       http://localhost:3006
echo  - Customer Service: http://localhost:3007
echo  - Analytics ^& BI:   http://localhost:3008
echo.
echo  BACKEND APIs:
echo  - Logistics:        http://localhost:8002
echo  - HR System:        http://localhost:8004/docs
echo  - E-commerce:       http://localhost:8005/docs
echo  - Retail POS:       http://localhost:8006/api
echo  - Customer Service: http://localhost:8007/health
echo  - Analytics:        http://localhost:8008/docs
echo.
echo ============================================
echo.
echo All servers are running in separate windows.
echo Close each window individually to stop that team.
echo.
echo Press any key to open Analytics Dashboard...
pause >nul

timeout /t 3 /nobreak >nul
start http://localhost:3008

echo.
echo System is fully operational!
echo.
pause
