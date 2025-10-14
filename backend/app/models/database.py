# backend/app/models/database.py
"""
Database Models untuk GAJAH NUSA ERP Anti-Fraud System
"""

from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Boolean, Text, JSON, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import uuid
import enum

# Database configuration
import os
DATABASE_URL = f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'erp_antifraud.db')}"  # Using SQLite for development

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Enums
class UserRole(str, enum.Enum):
    SALES_TOKO = "sales_toko"
    SALES_PROJECT = "sales_project"
    SUPERVISOR_TOKO = "supervisor_toko"
    SUPERVISOR_PROJECT = "supervisor_project"
    MANAGER = "manager"
    ADMIN = "admin"
    OWNER = "owner"

class AreaType(str, enum.Enum):
    URBAN = "urban"
    SUBURBAN = "suburban"
    RURAL = "rural"

class NotaStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PROCESS_PAYMENT = "process_payment"
    PAID = "paid"
    CANCELLED = "cancelled"

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESS = "process"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class OrderStatus(str, enum.Enum):
    DRAFT = "draft"
    ORDER = "order"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class VisitStatus(str, enum.Enum):
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

# Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    area_type = Column(Enum(AreaType), nullable=False)
    area_detail = Column(JSON, nullable=True)
    address = Column(Text, nullable=True)
    phone_personal = Column(String(20), nullable=False)
    phone_office = Column(String(20), nullable=True)
    
    # Security fields
    face_encoding = Column(Text, nullable=True)
    fingerprint_hash = Column(String(255), nullable=True)
    fraud_score = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    payments = relationship("Payment", back_populates="salesman")
    fraud_logs = relationship("FraudDetectionLog", back_populates="user")

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)  # toko, warung, supermarket
    address = Column(Text, nullable=False)
    phone_store = Column(String(20), nullable=True)
    phone_owner = Column(String(20), nullable=False)
    email = Column(String(100), nullable=True)
    
    # Geographic data
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    area_code = Column(String(10), nullable=False)
    
    # Business data
    credit_limit = Column(Float, default=0.0)
    credit_used = Column(Float, default=0.0)
    payment_terms = Column(Integer, default=30)  # days
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    notas = relationship("Nota", back_populates="customer")
    payments = relationship("Payment", back_populates="customer")

class Nota(Base):
    __tablename__ = "notas"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nota_number = Column(String(30), unique=True, nullable=False, index=True)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    salesman_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Financial data
    amount = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    
    # Security & tracking
    qr_code = Column(Text, nullable=False)  # Unique hash for QR
    qr_scan_count = Column(Integer, default=0)
    status = Column(Enum(NotaStatus), default=NotaStatus.DRAFT)
    
    # Geographic data
    created_latitude = Column(Float, nullable=True)
    created_longitude = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    due_date = Column(DateTime, nullable=False)
    
    # Relationships
    customer = relationship("Customer", back_populates="notas")
    salesman = relationship("User")
    payments = relationship("Payment", back_populates="nota")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nota_id = Column(String(36), ForeignKey("notas.id"), nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    salesman_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Payment data
    amount = Column(Float, nullable=False)
    payment_method = Column(String(20), nullable=False)  # cash, transfer, giro
    receipt_photo_url = Column(Text, nullable=True)
    payment_proof_url = Column(Text, nullable=True)
    
    # Anti-fraud fields
    otp_code = Column(String(10), nullable=True)
    otp_verified = Column(Boolean, default=False)
    fraud_flag = Column(Boolean, default=False)
    fraud_reason = Column(Text, nullable=True)
    
    # Geographic validation
    gps_latitude = Column(Float, nullable=False)
    gps_longitude = Column(Float, nullable=False)
    location_verified = Column(Boolean, default=False)
    
    # Timing validation
    deposited_at = Column(DateTime, nullable=True)
    late_deposit_hours = Column(Integer, default=0)
    
    # Status
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    nota = relationship("Nota", back_populates="payments")
    customer = relationship("Customer", back_populates="payments")
    salesman = relationship("User", back_populates="payments")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False)
    unit = Column(String(20), nullable=False)  # pcs, kg, liter, etc.
    
    # Pricing
    base_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    
    # Stock
    stock_quantity = Column(Integer, default=0)
    min_stock = Column(Integer, default=0)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number = Column(String(30), unique=True, nullable=False, index=True)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    salesman_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Order data
    total_amount = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    final_amount = Column(Float, nullable=False)
    
    # Status and tracking
    status = Column(Enum(OrderStatus), default=OrderStatus.DRAFT)
    order_date = Column(DateTime, default=datetime.utcnow)
    delivery_date = Column(DateTime, nullable=True)
    
    # Geographic data
    delivery_latitude = Column(Float, nullable=True)
    delivery_longitude = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    customer = relationship("Customer")
    salesman = relationship("User")
    order_items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    
    # Item data
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    order = relationship("Order", back_populates="order_items")
    product = relationship("Product")

class SalesVisit(Base):
    __tablename__ = "sales_visits"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    salesman_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    
    # Visit data
    visit_type = Column(String(20), nullable=False)  # regular, follow_up, emergency
    planned_date = Column(DateTime, nullable=True)
    check_in = Column(DateTime, nullable=True)
    check_out = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    
    # QR and location validation
    qr_scan_time = Column(DateTime, nullable=True)
    qr_valid = Column(Boolean, default=False)
    gps_latitude = Column(Float, nullable=True)
    gps_longitude = Column(Float, nullable=True)
    gps_accuracy = Column(Float, nullable=True)
    location_valid = Column(Boolean, default=False)
    
    # Anti-fraud detection
    qr_fraud_attempt = Column(Boolean, default=False)
    location_fraud_attempt = Column(Boolean, default=False)
    
    # Visit notes
    notes = Column(Text, nullable=True)
    competitor_info = Column(Text, nullable=True)
    customer_feedback = Column(Text, nullable=True)
    
    # Status
    status = Column(Enum(VisitStatus), default=VisitStatus.PLANNED)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    salesman = relationship("User")
    customer = relationship("Customer")

class Delivery(Base):
    __tablename__ = "deliveries"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False)
    driver_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Delivery data
    delivery_date = Column(DateTime, nullable=False)
    estimated_arrival = Column(DateTime, nullable=True)
    actual_arrival = Column(DateTime, nullable=True)
    
    # Location tracking
    pickup_latitude = Column(Float, nullable=True)
    pickup_longitude = Column(Float, nullable=True)
    delivery_latitude = Column(Float, nullable=True)
    delivery_longitude = Column(Float, nullable=True)
    
    # Status
    status = Column(String(20), default="scheduled")  # scheduled, picked_up, in_transit, delivered, failed
    
    # Notes
    delivery_notes = Column(Text, nullable=True)
    recipient_name = Column(String(100), nullable=True)
    signature_url = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order = relationship("Order")
    driver = relationship("User")

class FraudDetectionLog(Base):
    __tablename__ = "fraud_detection_logs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    entity_type = Column(String(20), nullable=False)  # payment, nota, login
    entity_id = Column(String(36), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    
    # Fraud detection data
    fraud_type = Column(String(50), nullable=False)
    fraud_score = Column(Float, nullable=False)
    detection_method = Column(String(50), nullable=False)
    confidence_level = Column(Float, default=0.0)
    
    # Details and actions
    details = Column(JSON, nullable=True)
    action_taken = Column(String(100), nullable=True)
    false_positive = Column(Boolean, nullable=True)
    
    # Timestamps
    detected_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="fraud_logs")

# Create all tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Dependency untuk mendapatkan database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
