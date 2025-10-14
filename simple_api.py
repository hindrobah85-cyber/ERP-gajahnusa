# Simple FastAPI Server for Mobile Testing
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import uuid
from datetime import datetime

app = FastAPI(title="GAJAH NUSA ERP API", version="1.0.0")

# Enable CORS for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple models
class LoginRequest(BaseModel):
    username: str
    password: str

class SimpleLoginRequest(BaseModel):
    employee_id: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    user: Dict[str, Any]

# Mock data
MOCK_USERS = {
    "EMP001": {
        "id": "EMP001",
        "name": "Sales Manager",
        "role": "sales",
        "password": "password123"
    },
    "admin": {
        "id": "admin",
        "name": "System Administrator",
        "role": "admin",
        "password": "admin123"
    }
}

@app.get("/")
async def root():
    return {"message": "GAJAH NUSA ERP API Server Running", "status": "active"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(request: SimpleLoginRequest):
    user = MOCK_USERS.get(request.employee_id)
    
    if not user or user["password"] != request.password:
        return {"error": "Invalid credentials"}, 401
    
    token = str(uuid.uuid4())
    
    return LoginResponse(
        access_token=token,
        user={
            "id": user["id"],
            "name": user["name"],
            "role": user["role"],
            "employee_id": user["id"]
        }
    )

@app.post("/api/login")
async def simple_login(request: LoginRequest):
    user = MOCK_USERS.get(request.username)
    
    if not user or user["password"] != request.password:
        return {"error": "Invalid credentials"}, 401
    
    token = str(uuid.uuid4())
    
    return {
        "access_token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "role": user["role"],
            "username": user["id"]
        }
    }

@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    return {
        "total_customers": 156,
        "today_visits": 23,
        "pending_payments": 12,
        "total_revenue": 2500000,
        "fraud_alerts": 2
    }

@app.get("/api/dashboard")
async def get_dashboard():
    return {
        "stats": {
            "total_customers": 156,
            "today_visits": 23,
            "pending_payments": 12,
            "total_revenue": 2500000,
            "fraud_alerts": 2
        },
        "recent_transactions": [
            {"id": "TXN001", "amount": 150000, "customer": "PT ABC", "status": "completed"},
            {"id": "TXN002", "amount": 75000, "customer": "CV XYZ", "status": "pending"}
        ],
        "alerts": [
            {"type": "fraud", "message": "Suspicious transaction detected", "time": "10:30"}
        ]
    }

@app.post("/api/customer/checkin")
async def customer_checkin(data: Dict[str, Any]):
    return {
        "success": True,
        "message": "Customer check-in successful",
        "checkin_id": str(uuid.uuid4()),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/payment/collect")
async def collect_payment(data: Dict[str, Any]):
    return {
        "success": True,
        "message": "Payment collection recorded",
        "payment_id": str(uuid.uuid4()),
        "otp": "123456",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/payment/verify")
async def verify_payment(data: Dict[str, Any]):
    return {
        "success": True,
        "message": "Payment verified successfully",
        "verification_id": str(uuid.uuid4())
    }

@app.post("/api/payment")
async def process_payment(data: Dict[str, Any]):
    return {
        "success": True,
        "message": "Payment processed successfully",
        "payment_id": str(uuid.uuid4()),
        "amount": data.get("amount", 0),
        "status": "completed",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/reports/financial")
async def get_financial_reports():
    return {
        "period": "2025-09",
        "total_revenue": 5000000,
        "total_expenses": 2000000,
        "profit": 3000000,
        "transactions": 45,
        "customers": 23
    }

@app.get("/api/reports/transactions")
async def get_transaction_reports():
    return {
        "total_transactions": 145,
        "successful": 140,
        "failed": 5,
        "pending": 0,
        "total_amount": 15000000,
        "average_amount": 103448
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
