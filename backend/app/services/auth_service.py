# backend/app/services/auth_service.py
"""
Authentication Service dengan Face Recognition & Anti-Fraud
Terintegrasi dengan database models
"""

from fastapi import HTTPException, Depends, File, UploadFile, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Dict
# import face_recognition  # TODO: Install face_recognition library
# import numpy as np  # Commented out due to compatibility issues
# import cv2  # Commented out due to compatibility issues
import jwt
import bcrypt
import secrets
import qrcode
import io
import base64
from datetime import datetime, timedelta
import hashlib
import json
from twilio.rest import Client  # Untuk OTP SMS
import asyncio
import redis
from sqlalchemy.orm import Session

# Import models dari file sebelumnya
from models.database import User, Customer, Nota, Payment, FraudDetectionLog, SessionLocal, NotaStatus, PaymentStatus

# ============= CONFIG =============
class Config:
    SECRET_KEY = "your-secret-key-change-in-production"
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    REFRESH_TOKEN_EXPIRE_DAYS = 7
    OTP_EXPIRE_MINUTES = 5
    FRAUD_THRESHOLD = 0.7
    REDIS_URL = "redis://localhost:6379"
    TWILIO_ACCOUNT_SID = "your-twilio-sid"
    TWILIO_AUTH_TOKEN = "your-twilio-token"
    TWILIO_PHONE = "+1234567890"

# ============= REDIS CACHE =============
redis_client = redis.from_url(Config.REDIS_URL, decode_responses=True)

# ============= PYDANTIC MODELS =============
class UserRegister(BaseModel):
    employee_id: str
    name: str
    email: str  # Changed from EmailStr to str
    password: str
    role: str
    area_type: str
    area_detail: Dict
    address: str
    phone_personal: str
    phone_office: Optional[str] = None
    face_image: str  # Base64 encoded image
    ktp_image: str  # Base64 encoded image
    fingerprint_data: Optional[str] = None

class LoginRequest(BaseModel):
    employee_id: str
    password: str
    face_image: Optional[str] = None  # Untuk face login
    fingerprint: Optional[str] = None  # Untuk fingerprint login
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    device_info: Optional[Dict] = None

class PaymentRequest(BaseModel):
    nota_id: str
    customer_id: str
    amount: float
    payment_method: str  # cash, transfer, giro
    receipt_photo: str  # Base64 - foto uang+nota+salesman
    payment_proof: Optional[str] = None  # Bukti transfer
    latitude: float
    longitude: float

class NotaVerification(BaseModel):
    nota_number: str
    qr_code: str
    scan_latitude: float
    scan_longitude: float

# ============= AUTHENTICATION SERVICE =============
class AuthService:
    def __init__(self):
        self.twilio_client = Client(Config.TWILIO_ACCOUNT_SID, Config.TWILIO_AUTH_TOKEN)
    
    def get_db(self):
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    # ============= FACE RECOGNITION =============
    async def register_face(self, face_image_base64: str, user_id: str, db: Session):
        """Register face encoding untuk user - Simplified version"""
        try:
            # TODO: Implement actual face recognition
            # For now, just store the base64 image
            user = db.query(User).filter(User.id == user_id).first()
            user.face_encoding = face_image_base64  # Store base64 for now
            db.commit()
            
            return {"message": "Face registered successfully"}
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Face registration failed: {str(e)}")
    
    async def verify_face(self, face_image_base64: str, user_id: str, db: Session):
        """Verify face untuk login - Simplified version"""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user or not user.face_encoding:
                return False
            
            # TODO: Implement actual face comparison
            # For now, just check if face image exists
            return len(face_image_base64) > 100  # Simple check
            
        except Exception as e:
            print(f"Face verification error: {str(e)}")
            return False
    
    # ============= PASSWORD & TOKEN =============
    def hash_password(self, password: str) -> str:
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def create_access_token(self, data: dict):
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=Config.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, Config.SECRET_KEY, algorithm=Config.ALGORITHM)
    
    # ============= USER REGISTRATION =============
    async def register_user(self, user_data: UserRegister, db: Session):
        """Register user dengan face recognition"""
        try:
            # Check if user exists
            existing = db.query(User).filter(
                (User.employee_id == user_data.employee_id) |
                (User.email == user_data.email)
            ).first()
            
            if existing:
                raise HTTPException(status_code=400, detail="User already exists")
            
            # Create user
            new_user = User(
                employee_id=user_data.employee_id,
                name=user_data.name,
                email=user_data.email,
                password_hash=self.hash_password(user_data.password),
                role=user_data.role,
                area_type=user_data.area_type,
                area_detail=user_data.area_detail,
                address=user_data.address,
                phone_personal=user_data.phone_personal,
                phone_office=user_data.phone_office
            )
            
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            # Register face
            await self.register_face(user_data.face_image, new_user.id, db)
            
            return {"message": "User registered successfully", "user_id": new_user.id}
            
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=str(e))
    
    # ============= LOGIN WITH FRAUD DETECTION =============
    async def login(self, login_data: LoginRequest, db: Session):
        """Login dengan multi-factor authentication"""
        user = db.query(User).filter(User.employee_id == login_data.employee_id).first()
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Check password
        if not self.verify_password(login_data.password, user.password_hash):
            # Log failed attempt
            await self.log_fraud_attempt(user.id, "failed_password", login_data, db)
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Face verification if provided
        if login_data.face_image:
            face_valid = await self.verify_face(login_data.face_image, user.id, db)
            if not face_valid:
                await self.log_fraud_attempt(user.id, "failed_face_recognition", login_data, db)
                raise HTTPException(status_code=401, detail="Face verification failed")
        
        # Check for suspicious location
        if login_data.latitude and login_data.longitude:
            location_valid = await self.verify_location(user, login_data.latitude, login_data.longitude)
            if not location_valid:
                await self.log_fraud_attempt(user.id, "suspicious_location", login_data, db)
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        
        # Create token
        access_token = self.create_access_token(
            data={"sub": user.employee_id, "role": user.role.value}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "role": user.role.value,
                "area_type": user.area_type.value
            }
        }
    
    async def log_fraud_attempt(self, user_id: str, fraud_type: str, data: LoginRequest, db: Session):
        """Log suspicious login attempts"""
        fraud_log = FraudDetectionLog(
            entity_type="login",
            entity_id=user_id,
            user_id=user_id,
            fraud_type=fraud_type,
            fraud_score=0.8,
            detection_method="login_validation",
            details={
                "latitude": data.latitude,
                "longitude": data.longitude,
                "device_info": data.device_info,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        db.add(fraud_log)
        db.commit()

# ============= NOTA & PAYMENT ANTI-FRAUD =============
class PaymentAntifraudService:
    def __init__(self):
        self.twilio_client = Client(Config.TWILIO_ACCOUNT_SID, Config.TWILIO_AUTH_TOKEN)
    
    def generate_nota_qr(self, nota_id: str, nota_number: str, amount: float) -> str:
        """Generate unique QR code untuk nota"""
        # Create unique hash
        data = f"{nota_id}|{nota_number}|{amount}|{datetime.utcnow().isoformat()}"
        hash_value = hashlib.sha256(data.encode()).hexdigest()
        
        # Generate QR
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(hash_value)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return hash_value, img_str
    
    async def verify_nota_qr(self, nota_data: NotaVerification, db: Session):
        """Verify nota QR code untuk pembayaran"""
        nota = db.query(Nota).filter(Nota.nota_number == nota_data.nota_number).first()
        
        if not nota:
            raise HTTPException(status_code=404, detail="Nota not found")
        
        # Check QR code
        if nota.qr_code != nota_data.qr_code:
            # Log fraud attempt
            fraud_log = FraudDetectionLog(
                entity_type="nota",
                entity_id=nota.id,
                fraud_type="invalid_qr_code",
                fraud_score=0.9,
                detection_method="qr_verification",
                details={"provided_qr": nota_data.qr_code, "expected_qr": nota.qr_code}
            )
            db.add(fraud_log)
            db.commit()
            
            raise HTTPException(status_code=400, detail="Invalid QR code")
        
        # Check if nota already in payment process
        if nota.status in [NotaStatus.PROCESS_PAYMENT, NotaStatus.PAID]:
            raise HTTPException(status_code=400, detail="Nota already in payment process or paid")
        
        # Increment scan count
        nota.qr_scan_count += 1
        
        # Check for multiple scans (potential fraud)
        if nota.qr_scan_count > 3:
            fraud_log = FraudDetectionLog(
                entity_type="nota",
                entity_id=nota.id,
                fraud_type="excessive_qr_scans",
                fraud_score=0.7,
                detection_method="scan_count_check",
                details={"scan_count": nota.qr_scan_count}
            )
            db.add(fraud_log)
        
        # Update status
        nota.status = NotaStatus.PROCESS_PAYMENT
        db.commit()
        
        return {"message": "Nota verified", "nota_id": nota.id, "amount": nota.amount}
    
    async def process_payment(self, payment_data: PaymentRequest, salesman_id: str, db: Session):
        """Process payment dengan anti-fraud validation"""
        # Verify nota
        nota = db.query(Nota).filter(Nota.id == payment_data.nota_id).first()
        if not nota:
            raise HTTPException(status_code=404, detail="Nota not found")
        
        # Generate OTP
        otp = secrets.token_hex(3).upper()  # 6 character OTP
        
        # Create payment record
        payment = Payment(
            nota_id=payment_data.nota_id,
            customer_id=payment_data.customer_id,
            salesman_id=salesman_id,
            amount=payment_data.amount,
            payment_method=payment_data.payment_method,
            receipt_photo_url=payment_data.receipt_photo,  # In production, upload to S3
            payment_proof_url=payment_data.payment_proof,
            otp_code=otp,
            gps_latitude=payment_data.latitude,
            gps_longitude=payment_data.longitude,
            status=PaymentStatus.PENDING
        )
        
        db.add(payment)
        db.commit()
        
        # Send OTP to customer
        customer = db.query(Customer).filter(Customer.id == payment_data.customer_id).first()
        if customer and customer.phone_owner:
            await self.send_otp(customer.phone_owner, otp)
        
        # Set Redis timer for 24 hour validation
        redis_client.setex(
            f"payment:{payment.id}",
            86400,  # 24 hours in seconds
            json.dumps({"salesman_id": salesman_id, "amount": payment_data.amount})
        )
        
        # Start background task for 24-hour check
        asyncio.create_task(self.check_payment_deposit(payment.id, db))
        
        return {
            "payment_id": payment.id,
            "status": "pending_otp",
            "message": "OTP sent to customer"
        }
    
    async def send_otp(self, phone_number: str, otp: str):
        """Send OTP via SMS"""
        try:
            message = self.twilio_client.messages.create(
                body=f"Your payment verification OTP is: {otp}. Valid for 5 minutes.",
                from_=Config.TWILIO_PHONE,
                to=phone_number
            )
            return message.sid
        except Exception as e:
            print(f"Failed to send OTP: {str(e)}")
    
    async def verify_payment_otp(self, payment_id: str, otp: str, db: Session):
        """Verify OTP for payment confirmation"""
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        if payment.otp_code != otp:
            payment.fraud_flag = True
            payment.fraud_reason = "Invalid OTP attempted"
            db.commit()
            raise HTTPException(status_code=400, detail="Invalid OTP")
        
        # Mark OTP as verified
        payment.otp_verified = True
        payment.status = PaymentStatus.PROCESS
        db.commit()
        
        return {"message": "Payment confirmed by customer"}
    
    async def check_payment_deposit(self, payment_id: str, db: Session):
        """Background task to check if payment deposited within 24 hours"""
        await asyncio.sleep(86400)  # Wait 24 hours
        
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        
        if payment and not payment.deposited_at:
            # Mark as potentially fraudulent
            payment.fraud_flag = True
            payment.fraud_reason = "Payment not deposited within 24 hours"
            payment.late_deposit_hours = 24
            
            # Create fraud log
            fraud_log = FraudDetectionLog(
                entity_type="payment",
                entity_id=payment.id,
                user_id=payment.salesman_id,
                fraud_type="late_deposit",
                fraud_score=0.8,
                detection_method="24_hour_check",
                action_taken="flagged_for_review",
                details={
                    "amount": payment.amount,
                    "salesman_id": payment.salesman_id,
                    "hours_late": 24
                }
            )
            db.add(fraud_log)
            
            # Update salesman fraud score
            salesman = db.query(User).filter(User.id == payment.salesman_id).first()
            if salesman:
                salesman.fraud_score = min(salesman.fraud_score + 0.1, 1.0)
            
            db.commit()
            
            # Send alert to supervisor/manager
            await self.send_fraud_alert(payment.salesman_id, payment.id, db)
    
    async def send_fraud_alert(self, salesman_id: str, payment_id: str, db: Session):
        """Send fraud alert to supervisors"""
        # Get supervisors
        supervisors = db.query(User).filter(
            User.role.in_(['supervisor_toko', 'manager'])
        ).all()
        
        for supervisor in supervisors:
            # In production, send actual notification
            print(f"FRAUD ALERT to {supervisor.name}: Payment {payment_id} by {salesman_id} not deposited")

# ============= ML FRAUD DETECTION ENGINE =============
class MLFraudDetector:
    """Machine Learning based fraud detection"""
    
    def __init__(self):
        self.model = None  # Load pre-trained model
    
    async def analyze_payment_pattern(self, salesman_id: str, db: Session):
        """Analyze payment patterns for anomalies"""
        # Get recent payments
        recent_payments = db.query(Payment).filter(
            Payment.salesman_id == salesman_id,
            Payment.created_at >= datetime.utcnow() - timedelta(days=30)
        ).all()
        
        # Features for ML model
        delay_values = [p.late_deposit_hours for p in recent_payments if p.late_deposit_hours]
        features = {
            "total_payments": len(recent_payments),
            "avg_deposit_delay": sum(delay_values) / len(delay_values) if delay_values else 0,
            "fraud_flags": sum(1 for p in recent_payments if p.fraud_flag),
            "payment_methods": [p.payment_method for p in recent_payments]
        }
        
        # Calculate fraud score (simplified - in production use actual ML model)
        fraud_score = 0.0
        if features["avg_deposit_delay"] > 12:
            fraud_score += 0.3
        if features["fraud_flags"] > 2:
            fraud_score += 0.4
        if recent_payments and len(set(features["payment_methods"])) == 1 and features["payment_methods"][0] == "cash":
            fraud_score += 0.2
        
        return min(fraud_score, 1.0)
    
    async def detect_qr_duplication(self, qr_code: str, db: Session):
        """Detect if QR code has been duplicated"""
        # Check for multiple notas with same QR
        duplicate_count = db.query(Nota).filter(Nota.qr_code == qr_code).count()
        
        if duplicate_count > 1:
            return True, duplicate_count
        
        return False, 0

# Initialize services
auth_service = AuthService()
payment_service = PaymentAntifraudService()
ml_detector = MLFraudDetector()