# backend/app/models/database.py
"""
Database Models untuk ERP Anti-Fraud System
Semua model saling terintegrasi dengan foreign keys
"""

from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Boolean, Text, ForeignKey, Enum, Table, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
import enum
import uuid

Base = declarative_base()

# ============= ENUMS =============
class UserRole(enum.Enum):
    OWNER = "owner"
    MANAGER = "manager"
    ADMIN = "admin"
    SUPERVISOR_TOKO = "supervisor_toko"
    SUPERVISOR_PROJECT = "supervisor_project"
    SALES_TOKO = "sales_toko"
    SALES_PROJECT = "sales_project"
    DRIVER = "driver"
    GUDANG = "gudang"

class AreaType(enum.Enum):
    OFFICE = "office"
    FIELD = "field"

class PaymentStatus(enum.Enum):
    PENDING = "pending"
    PROCESS = "process"
    VERIFIED = "verified"
    CANCELLED = "cancelled"

class NotaStatus(enum.Enum):
    ACTIVE = "active"
    PROCESS_PAYMENT = "process_payment"
    PAID = "paid"
    OVERDUE = "overdue"

class OrderStatus(enum.Enum):
    ORDER = "order"
    PROCESS_LOAD = "process_load"
    DELIVERY = "delivery"
    DONE = "done"

# ============= USER & AUTH =============
class User(Base):
    __tablename__ = 'users'
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    area_type = Column(Enum(AreaType), nullable=False)
    area_detail = Column(JSON)  # {"type": "toko", "location": ["Kediri", "Blitar"]}
    address = Column(Text)
    phone_personal = Column(String(20))
    phone_office = Column(String(20))
    face_encoding = Column(JSON)  # Untuk face recognition
    fingerprint_data = Column(Text)  # Encrypted fingerprint
    ktp_photo_url = Column(String(255))
    profile_photo_url = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    fraud_score = Column(Float, default=0.0)  # ML fraud detection score
    
    # Relationships
    activities = relationship("UserActivity", back_populates="user", cascade="all, delete-orphan")
    sales_visits = relationship("SalesVisit", back_populates="salesman")
    payments = relationship("Payment", back_populates="salesman")
    deliveries_as_driver = relationship("Delivery", back_populates="driver")

# ============= CUSTOMER & TOKO =============
class Customer(Base):
    __tablename__ = 'customers'
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    store_name = Column(String(100), nullable=False)
    owner_name = Column(String(100), nullable=False)
    ktp_number = Column(String(20), unique=True)
    ktp_photo_url = Column(String(255))
    phone_store = Column(String(20))
    phone_owner = Column(String(20))
    address = Column(Text, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    credit_limit = Column(Float, default=0.0)
    credit_used = Column(Float, default=0.0)
    qr_code = Column(String(100), unique=True)  # QR untuk absensi
    store_photo_url = Column(String(255))
    customer_type = Column(String(20))  # 'toko' atau 'project'
    area = Column(String(50))
    status = Column(String(20), default='pending')  # pending, approved, rejected
    approved_by = Column(String(50), ForeignKey('users.id'))
    approved_at = Column(DateTime)
    rejection_reason = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String(50), ForeignKey('users.id'))
    
    # Relationships
    orders = relationship("Order", back_populates="customer")
    payments = relationship("Payment", back_populates="customer")
    visits = relationship("SalesVisit", back_populates="customer")
    notas = relationship("Nota", back_populates="customer")

# ============= NOTA & ANTI-FRAUD =============
class Nota(Base):
    __tablename__ = 'notas'
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    nota_number = Column(String(30), unique=True, nullable=False)
    customer_id = Column(String(50), ForeignKey('customers.id'))
    order_id = Column(String(50), ForeignKey('orders.id'))
    amount = Column(Float, nullable=False)
    status = Column(Enum(NotaStatus), default=NotaStatus.ACTIVE)
    qr_code = Column(String(255), unique=True)  # QR unik untuk pembayaran
    qr_scan_count = Column(Integer, default=0)  # Hitung scan untuk deteksi fraud
    issued_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime)
    payment_date = Column(DateTime)
    overdue_days = Column(Integer, default=0)
    last_reminder_sent = Column(DateTime)
    
    # Anti-fraud fields
    original_hash = Column(String(255))  # Hash nota asli
    is_verified = Column(Boolean, default=False)
    verification_photo_url = Column(String(255))  # Foto saat pembayaran
    
    # Relationships
    customer = relationship("Customer", back_populates="notas")
    order = relationship("Order", back_populates="nota")
    payments = relationship("Payment", back_populates="nota")

# ============= PAYMENT WITH FRAUD DETECTION =============
class Payment(Base):
    __tablename__ = 'payments'
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    nota_id = Column(String(50), ForeignKey('notas.id'))
    customer_id = Column(String(50), ForeignKey('customers.id'))
    salesman_id = Column(String(50), ForeignKey('users.id'))
    amount = Column(Float, nullable=False)
    payment_method = Column(String(20))  # cash, transfer, giro
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    
    # Anti-fraud tracking
    receipt_photo_url = Column(String(255))  # Foto uang + nota + salesman
    payment_proof_url = Column(String(255))  # Bukti transfer/giro
    otp_code = Column(String(6))
    otp_verified = Column(Boolean, default=False)
    gps_latitude = Column(Float)  # Lokasi saat input pembayaran
    gps_longitude = Column(Float)
    
    # Timeline tracking
    created_at = Column(DateTime, default=datetime.utcnow)
    verified_at = Column(DateTime)
    deposited_at = Column(DateTime)  # Kapan uang masuk rekening kantor
    
    # Fraud detection
    fraud_flag = Column(Boolean, default=False)
    fraud_reason = Column(Text)
    late_deposit_hours = Column(Integer, default=0)  # Berapa jam terlambat setor
    
    # Relationships
    nota = relationship("Nota", back_populates="payments")
    customer = relationship("Customer", back_populates="payments")
    salesman = relationship("User", back_populates="payments")

# ============= ORDER =============
class Order(Base):
    __tablename__ = 'orders'
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number = Column(String(30), unique=True, nullable=False)
    customer_id = Column(String(50), ForeignKey('customers.id'))
    salesman_id = Column(String(50), ForeignKey('users.id'))
    total_amount = Column(Float, nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.ORDER)
    created_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime)
    delivered_at = Column(DateTime)
    
    # Relationships
    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    nota = relationship("Nota", back_populates="order", uselist=False)
    delivery = relationship("Delivery", back_populates="order", uselist=False)

class OrderItem(Base):
    __tablename__ = 'order_items'
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(50), ForeignKey('orders.id'))
    product_id = Column(String(50), ForeignKey('products.id'))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    discount1 = Column(Float, default=0)
    discount2 = Column(Float, default=0)
    discount3 = Column(Float, default=0)
    total_price = Column(Float, nullable=False)
    
    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product")

# ============= PRODUCT =============
class Product(Base):
    __tablename__ = 'products'
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    unit = Column(String(20))
    price_list = Column(Float, nullable=False)
    stock_warehouse = Column(Integer, default=0)
    stock_minimum = Column(Integer, default=0)
    category = Column(String(50))
    is_active = Column(Boolean, default=True)

# ============= SALES VISIT =============
class SalesVisit(Base):
    __tablename__ = 'sales_visits'
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    salesman_id = Column(String(50), ForeignKey('users.id'))
    customer_id = Column(String(50), ForeignKey('customers.id'))
    visit_type = Column(String(20))  # 'new_outlet', 'regular'
    
    # Absensi & Validation
    qr_scan_time = Column(DateTime)
    qr_valid = Column(Boolean, default=False)
    selfie_url = Column(String(255))
    gps_latitude = Column(Float)
    gps_longitude = Column(Float)
    gps_accuracy = Column(Float)  # Akurasi GPS dalam meter
    
    # Visit details
    check_in = Column(DateTime)
    check_out = Column(DateTime)
    duration_minutes = Column(Integer)
    notes = Column(Text)
    competitor_info = Column(Text)
    
    # Fraud detection
    location_valid = Column(Boolean, default=True)  # GPS sesuai dengan toko?
    qr_fraud_attempt = Column(Boolean, default=False)
    
    # Relationships
    salesman = relationship("User", back_populates="sales_visits")
    customer = relationship("Customer", back_populates="visits")

# ============= DELIVERY =============
class Delivery(Base):
    __tablename__ = 'deliveries'
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    delivery_number = Column(String(30), unique=True, nullable=False)
    order_id = Column(String(50), ForeignKey('orders.id'))
    driver_id = Column(String(50), ForeignKey('users.id'))
    vehicle_number = Column(String(20))
    helper_name = Column(String(100))
    
    # Route & Timeline
    route_plan = Column(JSON)  # GPS route yang direncanakan
    actual_route = Column(JSON)  # GPS route aktual
    departure_time = Column(DateTime)
    arrival_time = Column(DateTime)
    completion_time = Column(DateTime)
    
    # Delivery details
    items_delivered = Column(JSON)
    items_returned = Column(JSON)
    items_damaged = Column(JSON)
    delivery_photo_url = Column(String(255))
    recipient_name = Column(String(100))
    recipient_signature_url = Column(String(255))
    delivery_notes = Column(Text)
    
    # Relationships
    order = relationship("Order", back_populates="delivery")
    driver = relationship("User", back_populates="deliveries_as_driver")

# ============= USER ACTIVITY LOGGING =============
class UserActivity(Base):
    __tablename__ = 'user_activities'
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(50), ForeignKey('users.id'))
    activity_type = Column(String(50))
    description = Column(Text)
    ip_address = Column(String(50))
    device_info = Column(JSON)
    gps_latitude = Column(Float)
    gps_longitude = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Fraud detection
    suspicious = Column(Boolean, default=False)
    fraud_score = Column(Float, default=0.0)
    
    # Relationships
    user = relationship("User", back_populates="activities")

# ============= ML FRAUD DETECTION LOG =============
class FraudDetectionLog(Base):
    __tablename__ = 'fraud_detection_logs'
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    entity_type = Column(String(50))  # 'payment', 'visit', 'order', etc
    entity_id = Column(String(50))
    user_id = Column(String(50), ForeignKey('users.id'))
    fraud_score = Column(Float)
    fraud_type = Column(String(100))
    detection_method = Column(String(100))
    action_taken = Column(String(100))
    details = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

# Database initialization
DATABASE_URL = "postgresql://user:password@localhost/erp_antifraud"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)