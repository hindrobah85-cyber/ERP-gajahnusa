# backend/app/main.py
"""
Main FastAPI Application - ERP Anti-Fraud System
Menghubungkan semua services dengan API endpoints
"""

from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, cast
import jwt
from datetime import datetime, timedelta
import logging
from contextlib import asynccontextmanager

# Import dari file-file sebelumnya
from app.models.database import (
    SessionLocal, get_db, create_tables,
    User, Customer, Nota, Payment, FraudDetectionLog,
    UserRole, PaymentStatus, NotaStatus, AreaType,
    SalesVisit, Order, OrderItem, OrderStatus
)
from app.services.auth_service import (
    AuthService, PaymentAntifraudService, MLFraudDetector,
    UserRegister, LoginRequest, PaymentRequest, NotaVerification,
    Config
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============= APP INITIALIZATION =============
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting ERP Anti-Fraud System...")
    create_tables()
    yield
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(
    title="ERP Anti-Fraud System",
    description="Sistem ERP dengan Anti-Fraud Detection",
    version="1.0.0",
    lifespan=lifespan
)

# ============= CORS CONFIGURATION =============
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:19006"],  # React & React Native
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============= DEPENDENCIES =============
security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Validate JWT token and return current user"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=[Config.ALGORITHM])
        employee_id = payload.get("sub")
        if employee_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.query(User).filter(User.employee_id == employee_id).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def check_role(allowed_roles: List[UserRole]):
    """Role-based access control decorator"""
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# ============= INITIALIZE SERVICES =============
auth_service = AuthService()
payment_service = PaymentAntifraudService()
ml_detector = MLFraudDetector()

# ============= AUTH ENDPOINTS =============
@app.post("/api/auth/register")
async def register(
    user_data: UserRegister,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Register new user dengan face recognition"""
    try:
        result = await auth_service.register_user(user_data, db)
        
        # Background task untuk ML training
        background_tasks.add_task(
            train_fraud_model_for_user, 
            user_data.employee_id
        )
        
        return result
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login")
async def login(
    login_data: LoginRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Multi-factor authentication login"""
    # Add device info from request
    login_data.device_info = {
        "ip": request.client.host if request.client else "unknown",
        "user_agent": request.headers.get("user-agent", "")
    }
    
    result = await auth_service.login(login_data, db)
    return result

@app.post("/api/auth/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user"""
    # In production, invalidate token in Redis
    return {"message": "Logged out successfully"}

# ============= CUSTOMER MANAGEMENT =============
@app.post("/api/customers/register")
async def register_customer(
    store_name: str,
    owner_name: str,
    ktp_number: str,
    phone_store: str,
    phone_owner: str,
    address: str,
    credit_limit: float,
    customer_type: str,
    area: str,
    latitude: float,
    longitude: float,
    store_photo: UploadFile = File(...),
    ktp_photo: UploadFile = File(...),
    current_user: User = Depends(check_role([UserRole.SALES_TOKO, UserRole.SALES_PROJECT])),
    db: Session = Depends(get_db)
):
    """Register new customer/toko dengan approval workflow"""
    try:
        # Generate unique QR for customer
        import uuid
        import hashlib
        customer_id = str(uuid.uuid4())
        qr_data = f"{customer_id}|{store_name}|{datetime.utcnow().isoformat()}"
        qr_code = hashlib.sha256(qr_data.encode()).hexdigest()
        
        # Create customer record
        new_customer = Customer(
            id=customer_id,
            store_name=store_name,
            owner_name=owner_name,
            ktp_number=ktp_number,
            phone_store=phone_store,
            phone_owner=phone_owner,
            address=address,
            latitude=latitude,
            longitude=longitude,
            credit_limit=credit_limit,
            customer_type=customer_type,
            area=area,
            qr_code=qr_code,
            status='pending',
            created_by=current_user.id
        )
        
        db.add(new_customer)
        db.commit()
        
        # Send notification to supervisor
        # In production, implement actual notification
        
        return {
            "customer_id": customer_id,
            "status": "pending_approval",
            "message": "Customer registration submitted for approval"
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Customer registration error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/customers")
async def get_customers(
    status: Optional[str] = None,
    area: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get customers based on user role and area"""
    query = db.query(Customer)
    
    # Filter based on user role
    if current_user.role.value == UserRole.SALES_TOKO.value:
        # Only show customers in salesman's area
        user_areas = current_user.area_detail.get("location", [])
        query = query.filter(Customer.area.in_(user_areas))
    elif current_user.role.value == UserRole.SALES_PROJECT.value:
        query = query.filter(Customer.customer_type == "project")
    
    if status:
        query = query.filter(Customer.status == status)
    if area:
        query = query.filter(Customer.area == area)
    
    customers = query.all()
    return customers

@app.put("/api/customers/{customer_id}/approve")
async def approve_customer(
    customer_id: str,
    approved: bool,
    rejection_reason: Optional[str] = None,
    current_user: User = Depends(check_role([UserRole.SUPERVISOR_TOKO, UserRole.SUPERVISOR_PROJECT, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """Approve or reject customer registration"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer.status = 'approved' if approved else 'rejected'
    customer.approved_by = current_user.id
    customer.approved_at = datetime.utcnow()
    if rejection_reason:
        customer.rejection_reason = rejection_reason
    
    db.commit()
    
    return {"message": f"Customer {'approved' if approved else 'rejected'} successfully"}

# ============= SALES VISIT & ABSENSI =============
@app.post("/api/visits/checkin")
async def sales_checkin(
    customer_id: str,
    qr_code: str,
    selfie: UploadFile,
    latitude: float,
    longitude: float,
    visit_type: str = "regular",
    current_user: User = Depends(check_role([UserRole.SALES_TOKO, UserRole.SALES_PROJECT])),
    db: Session = Depends(get_db)
):
    """Sales check-in at customer location with QR validation"""
    try:
        # Validate customer QR
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        if customer.qr_code != qr_code:
            # Log fraud attempt
            fraud_log = FraudDetectionLog(
                entity_type="visit",
                entity_id=customer_id,
                user_id=current_user.id,
                fraud_type="invalid_qr_scan",
                fraud_score=0.9,
                detection_method="qr_validation",
                details={
                    "provided_qr": qr_code,
                    "location": {"lat": latitude, "lng": longitude}
                }
            )
            db.add(fraud_log)
            db.commit()
            
            raise HTTPException(status_code=400, detail="Invalid QR code")
        
        # Validate location (within 100 meters of customer)
        from math import radians, cos, sin, asin, sqrt
        def haversine(lon1, lat1, lon2, lat2):
            lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            r = 6371  # Radius of earth in kilometers
            return c * r * 1000  # Convert to meters
        
        distance = haversine(longitude, latitude, customer.longitude, customer.latitude)
        location_valid = distance <= 100  # Within 100 meters
        
        if not location_valid:
            # Flag potential fraud
            qr_fraud_attempt = True
        else:
            qr_fraud_attempt = False
        
        # Create visit record
        visit = SalesVisit(
            salesman_id=current_user.id,
            customer_id=customer_id,
            visit_type=visit_type,
            qr_scan_time=datetime.utcnow(),
            qr_valid=not qr_fraud_attempt,
            gps_latitude=latitude,
            gps_longitude=longitude,
            gps_accuracy=distance,
            check_in=datetime.utcnow(),
            location_valid=location_valid,
            qr_fraud_attempt=qr_fraud_attempt
        )
        
        db.add(visit)
        db.commit()
        
        return {
            "visit_id": visit.id,
            "status": "checked_in",
            "location_valid": location_valid,
            "distance_from_store": round(distance, 2)
        }
        
    except Exception as e:
        logger.error(f"Check-in error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/visits/{visit_id}/checkout")
async def sales_checkout(
    visit_id: str,
    notes: Optional[str] = None,
    competitor_info: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sales check-out from customer location"""
    visit = db.query(SalesVisit).filter(
        SalesVisit.id == visit_id,
        SalesVisit.salesman_id == current_user.id
    ).first()
    
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    
    checkout_time = datetime.utcnow()
    setattr(visit, 'check_out', checkout_time)
    setattr(visit, 'duration_minutes', int((checkout_time - visit.check_in).total_seconds() / 60))
    setattr(visit, 'notes', notes)
    setattr(visit, 'competitor_info', competitor_info)
    
    db.commit()
    
    return {"message": "Checked out successfully", "duration": visit.duration_minutes}

# ============= NOTA & PAYMENT ANTI-FRAUD =============
@app.post("/api/nota/create")
async def create_nota(
    order_id: str,
    due_days: int = 60,
    current_user: User = Depends(check_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Create nota with unique QR code"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Generate nota number
    import random
    nota_number = f"NT{datetime.now().strftime('%Y%m%d')}{random.randint(1000, 9999)}"
    
    # Generate unique QR
    # Get the actual value from the order object - cast to avoid type checker issues
    total_amount_value = cast(float, order.total_amount) or 0.0
    qr_hash, qr_image = payment_service.generate_nota_qr(order_id, nota_number, total_amount_value)
    
    # Create nota
    nota = Nota(
        nota_number=nota_number,
        customer_id=order.customer_id,
        order_id=order_id,
        amount=order.total_amount,
        qr_code=qr_hash,
        due_date=datetime.utcnow() + timedelta(days=due_days),
        original_hash=qr_hash
    )
    
    db.add(nota)
    db.commit()
    
    return {
        "nota_id": nota.id,
        "nota_number": nota_number,
        "qr_code": qr_image,
        "amount": order.total_amount,
        "due_date": nota.due_date.isoformat()
    }

@app.post("/api/payment/initiate")
async def initiate_payment(
    payment_data: PaymentRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(check_role([UserRole.SALES_TOKO, UserRole.SALES_PROJECT])),
    db: Session = Depends(get_db)
):
    """Initiate payment with anti-fraud validation"""
    # Check salesman fraud score - cast to avoid type checker issues
    fraud_score = cast(float, current_user.fraud_score)
    if fraud_score > Config.FRAUD_THRESHOLD:
        raise HTTPException(
            status_code=403, 
            detail="Account flagged for review. Please contact supervisor."
        )
    
    user_id = cast(str, current_user.id)
    result = await payment_service.process_payment(payment_data, user_id, db)
    
    # Background ML analysis
    background_tasks.add_task(
        analyze_payment_pattern,
        user_id,
        payment_data.nota_id
    )
    
    return result

@app.post("/api/payment/{payment_id}/verify-otp")
async def verify_payment_otp(
    payment_id: str,
    otp: str,
    db: Session = Depends(get_db)
):
    """Customer verifies payment with OTP"""
    result = await payment_service.verify_payment_otp(payment_id, otp, db)
    return result

@app.post("/api/payment/{payment_id}/confirm-deposit")
async def confirm_deposit(
    payment_id: str,
    bank_reference: str,
    current_user: User = Depends(check_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Admin confirms money deposited to company account"""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    # Update payment attributes - direct assignment works for SQLAlchemy instances
    payment.deposited_at = datetime.utcnow()  # type: ignore
    payment.status = PaymentStatus.COMPLETED  # type: ignore
    
    # Calculate delay
    created_at = cast(datetime, payment.created_at)
    deposited_at = cast(datetime, payment.deposited_at)
    hours_delay = (deposited_at - created_at).total_seconds() / 3600
    payment.late_deposit_hours = max(0, hours_delay - 24)  # type: ignore
    
    # Update nota status
    nota = db.query(Nota).filter(Nota.id == payment.nota_id).first()
    if nota:
        nota.status = NotaStatus.PAID  # type: ignore
        nota.payment_date = datetime.utcnow()  # type: ignore
    
    # Update salesman fraud score if late
    late_deposit_hours = cast(float, payment.late_deposit_hours)
    if late_deposit_hours > 0:
        salesman = db.query(User).filter(User.id == payment.salesman_id).first()
        if salesman:
            current_fraud_score = cast(float, salesman.fraud_score)
            salesman.fraud_score = min(current_fraud_score + 0.05, 1.0)  # type: ignore
    
    db.commit()
    
    # Send WhatsApp notification to customer
    # In production, implement actual WA integration
    
    return {"message": "Payment verified and customer notified"}

# ============= ORDERS =============
@app.post("/api/orders/create")
async def create_order(
    customer_id: str,
    items: List[Dict],  # [{"product_id": "", "quantity": 0, "unit_price": 0}]
    current_user: User = Depends(check_role([UserRole.SALES_TOKO, UserRole.SALES_PROJECT])),
    db: Session = Depends(get_db)
):
    """Create new order"""
    try:
        # Check customer credit limit
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Calculate total
        total_amount = sum(item["quantity"] * item["unit_price"] for item in items)
        
        # Check credit limit - cast to avoid type checker issues
        credit_used = cast(float, customer.credit_used)
        credit_limit = cast(float, customer.credit_limit)
        if credit_used + total_amount > credit_limit:
            raise HTTPException(
                status_code=400, 
                detail=f"Order exceeds credit limit. Available: {credit_limit - credit_used}"
            )
        
        # Generate order number
        import random
        order_number = f"ORD{datetime.now().strftime('%Y%m%d')}{random.randint(1000, 9999)}"
        
        # Create order
        order = Order(
            order_number=order_number,
            customer_id=customer_id,
            salesman_id=current_user.id,
            total_amount=total_amount,
            status=OrderStatus.ORDER
        )
        
        db.add(order)
        db.flush()
        
        # Add order items
        for item in items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item["product_id"],
                quantity=item["quantity"],
                unit_price=item["unit_price"],
                total_price=item["quantity"] * item["unit_price"]
            )
            db.add(order_item)
        
        # Update customer credit
        customer.credit_used += total_amount  # type: ignore
        
        db.commit()
        
        return {
            "order_id": order.id,
            "order_number": order_number,
            "total_amount": total_amount,
            "status": "created"
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Order creation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# ============= DASHBOARD & ANALYTICS =============
@app.get("/api/dashboard/sales")
async def sales_dashboard(
    period: str = "daily",  # daily, weekly, monthly
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get sales dashboard based on user role"""
    from sqlalchemy import func
    
    # Calculate date range
    end_date = datetime.utcnow()
    if period == "daily":
        start_date = end_date - timedelta(days=1)
    elif period == "weekly":
        start_date = end_date - timedelta(days=7)
    else:
        start_date = end_date - timedelta(days=30)
    
    # Base query
    query = db.query(
        func.count(Order.id).label("total_orders"),
        func.sum(Order.total_amount).label("total_sales"),
        func.avg(Order.total_amount).label("avg_order_value")
    ).filter(Order.created_at.between(start_date, end_date))
    
    # Filter based on role
    if current_user.role in [UserRole.SALES_TOKO, UserRole.SALES_PROJECT]:
        query = query.filter(Order.salesman_id == current_user.id)
    elif current_user.role.value == UserRole.SUPERVISOR_TOKO.value:
        # Get all sales in toko areas
        sales_users = db.query(User).filter(User.role == UserRole.SALES_TOKO).all()
        sales_ids = [u.id for u in sales_users]
        query = query.filter(Order.salesman_id.in_(sales_ids))
    
    result = query.first()
    
    # Get visits data
    visits_query = db.query(func.count(SalesVisit.id)).filter(
        SalesVisit.check_in.between(start_date, end_date)
    )
    
    if current_user.role in [UserRole.SALES_TOKO, UserRole.SALES_PROJECT]:
        visits_query = visits_query.filter(SalesVisit.salesman_id == current_user.id)
    
    total_visits = visits_query.scalar()
    
    # Get payment collections
    payments_query = db.query(
        func.count(Payment.id).label("total_payments"),
        func.sum(Payment.amount).label("total_collected")
    ).filter(
        Payment.created_at.between(start_date, end_date),
        Payment.status == PaymentStatus.COMPLETED
    )
    
    if current_user.role in [UserRole.SALES_TOKO, UserRole.SALES_PROJECT]:
        payments_query = payments_query.filter(Payment.salesman_id == current_user.id)
    
    payment_result = payments_query.first()
    
    return {
        "period": period,
        "sales": {
            "total_orders": getattr(result, 'total_orders', 0) or 0,
            "total_sales": float(getattr(result, 'total_sales', 0) or 0),
            "avg_order_value": float(getattr(result, 'avg_order_value', 0) or 0)
        },
        "visits": {
            "total": total_visits or 0,
            "avg_per_day": total_visits / (1 if period == "daily" else 7 if period == "weekly" else 30)
        },
        "collections": {
            "total_payments": getattr(payment_result, 'total_payments', 0) or 0,
            "total_amount": float(getattr(payment_result, 'total_collected', 0) or 0)
        }
    }

@app.get("/api/dashboard/fraud-alerts")
async def fraud_alerts(
    current_user: User = Depends(check_role([UserRole.SUPERVISOR_TOKO, UserRole.SUPERVISOR_PROJECT, UserRole.MANAGER, UserRole.OWNER])),
    db: Session = Depends(get_db)
):
    """Get fraud alerts and suspicious activities"""
    # Get recent fraud logs
    fraud_logs = db.query(FraudDetectionLog).order_by(
        FraudDetectionLog.created_at.desc()
    ).limit(50).all()
    
    # Get high-risk users
    high_risk_users = db.query(User).filter(
        User.fraud_score > Config.FRAUD_THRESHOLD
    ).all()
    
    # Get late deposits
    late_payments = db.query(Payment).filter(
        Payment.late_deposit_hours > 0,
        Payment.deposited_at == None
    ).all()
    
    return {
        "fraud_logs": [
            {
                "id": log.id,
                "type": log.fraud_type,
                "entity": log.entity_type,
                "score": log.fraud_score,
                "timestamp": log.created_at.isoformat()
            } for log in fraud_logs
        ],
        "high_risk_users": [
            {
                "id": user.id,
                "name": user.name,
                "role": user.role.value,
                "fraud_score": user.fraud_score
            } for user in high_risk_users
        ],
        "pending_deposits": [
            {
                "payment_id": payment.id,
                "salesman_id": payment.salesman_id,
                "amount": payment.amount,
                "hours_late": payment.late_deposit_hours
            } for payment in late_payments
        ]
    }

# ============= BACKGROUND TASKS =============
async def train_fraud_model_for_user(employee_id: str):
    """Background task to train ML model for new user"""
    # In production, implement actual ML training
    logger.info(f"Training fraud detection model for user {employee_id}")

async def analyze_payment_pattern(salesman_id: str, nota_id: str):
    """Background task to analyze payment patterns"""
    db = SessionLocal()
    try:
        fraud_score = await ml_detector.analyze_payment_pattern(salesman_id, db)
        
        if fraud_score > Config.FRAUD_THRESHOLD:
            # Create alert
            fraud_log = FraudDetectionLog(
                entity_type="payment_pattern",
                entity_id=nota_id,
                user_id=salesman_id,
                fraud_score=fraud_score,
                fraud_type="suspicious_pattern",
                detection_method="ml_analysis",
                action_taken="flagged_for_review"
            )
            db.add(fraud_log)
            db.commit()
    finally:
        db.close()

# ============= HEALTH CHECK =============
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

# ============= ERROR HANDLERS =============
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )