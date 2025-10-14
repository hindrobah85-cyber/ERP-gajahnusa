"""
Attendance Microservice API
Port: 8002
Database: Shared with main ERP
Focus: Absensi, Check-in/out, Offline sync
"""
# pyright: reportOptionalMemberAccess=false
# type: ignore

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import sys
import os
from pathlib import Path
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
from datetime import datetime
from typing import Optional

# Database setup
DATABASE_URL = "sqlite:///./erp_antifraud.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

# Simplified models for attendance (reference existing tables)
class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}
    
    id: Mapped[str] = mapped_column(primary_key=True)
    username: Mapped[Optional[str]]
    full_name: Mapped[Optional[str]]
    area: Mapped[Optional[str]]

class Customer(Base):
    __tablename__ = "customers"
    __table_args__ = {'extend_existing': True}
    
    id: Mapped[str] = mapped_column(primary_key=True)
    name: Mapped[Optional[str]]
    address: Mapped[Optional[str]]
    phone: Mapped[Optional[str]]
    area: Mapped[Optional[str]]
    latitude: Mapped[Optional[float]]
    longitude: Mapped[Optional[float]]
    credit_limit: Mapped[Optional[float]]

class Product(Base):
    __tablename__ = "products"
    __table_args__ = {'extend_existing': True}
    
    id: Mapped[str] = mapped_column(primary_key=True)
    name: Mapped[Optional[str]]
    sku: Mapped[Optional[str]]
    price: Mapped[Optional[float]]
    stock_warehouse: Mapped[Optional[int]]
    stock_vehicle: Mapped[Optional[int]]
    unit: Mapped[Optional[str]]

class SalesVisit(Base):
    __tablename__ = "sales_visits"
    __table_args__ = {'extend_existing': True}
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    salesman_id: Mapped[Optional[str]]
    customer_id: Mapped[Optional[str]]
    check_in: Mapped[Optional[datetime]]
    check_out: Mapped[Optional[datetime]]
    latitude: Mapped[Optional[float]]
    longitude: Mapped[Optional[float]]
    photo_url: Mapped[Optional[str]]
    notes: Mapped[Optional[str]]
    location_valid: Mapped[Optional[bool]]
    duration_minutes: Mapped[Optional[int]]

class Order(Base):
    __tablename__ = "orders"
    __table_args__ = {'extend_existing': True}
    
    id: Mapped[str] = mapped_column(primary_key=True)
    salesman_id: Mapped[Optional[str]]
    customer_id: Mapped[Optional[str]]
    total_amount: Mapped[Optional[float]]
    status: Mapped[Optional[str]]
    created_at: Mapped[Optional[datetime]]

class OrderItem(Base):
    __tablename__ = "order_items"
    __table_args__ = {'extend_existing': True}
    
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[Optional[str]]
    product_id: Mapped[Optional[str]]
    quantity: Mapped[Optional[int]]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI(
    title="GAJAH NUSA - Attendance Microservice",
    description="Aplikasi Absensi Salesman dengan Offline-First Support",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== MODELS ====================

class CheckInRequest(BaseModel):
    salesman_id: str
    customer_id: str
    latitude: float
    longitude: float
    photo_url: Optional[str] = None
    notes: Optional[str] = None

class CheckOutRequest(BaseModel):
    visit_id: str
    notes: Optional[str] = None

class SyncRequest(BaseModel):
    salesman_id: str
    last_sync: Optional[str] = None

class OfflineAction(BaseModel):
    action_type: str  # "check_in", "check_out", "order"
    timestamp: str
    data: Dict

# ==================== ENDPOINTS ====================

@app.get("/")
async def root():
    return {
        "service": "GAJAH NUSA Attendance API",
        "version": "1.0.0",
        "status": "online",
        "port": 8002
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# ==================== ATTENDANCE ====================

@app.post("/api/attendance/checkin")
async def check_in(request: CheckInRequest, db: Session = Depends(get_db)):
    """Check-in salesman ke customer"""
    
    # Verify salesman exists
    salesman = db.query(User).filter(User.id == request.salesman_id).first()
    if not salesman:
        raise HTTPException(status_code=404, detail="Salesman not found")
    
    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == request.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Create visit record
    visit = SalesVisit(
        salesman_id=request.salesman_id,
        customer_id=request.customer_id,
        check_in=datetime.now(),
        latitude=request.latitude,
        longitude=request.longitude,
        photo_url=request.photo_url,
        notes=request.notes,
        location_valid=True  # You can add GPS validation here
    )
    
    db.add(visit)
    db.commit()
    db.refresh(visit)
    
    return {
        "success": True,
        "visit_id": visit.id,
        "check_in_time": visit.check_in.isoformat() if visit.check_in else None,
        "message": "Check-in berhasil"
    }

@app.post("/api/attendance/checkout")
async def check_out(request: CheckOutRequest, db: Session = Depends(get_db)):
    """Check-out salesman dari customer"""
    
    visit = db.query(SalesVisit).filter(SalesVisit.id == request.visit_id).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    
    if visit.check_out:
        raise HTTPException(status_code=400, detail="Already checked out")
    
    visit.check_out = datetime.now()
    if visit.check_in and visit.check_out:
        check_in_time: datetime = visit.check_in  # type: ignore
        check_out_time: datetime = visit.check_out  # type: ignore
        visit.duration_minutes = int((check_out_time - check_in_time).total_seconds() / 60)
    if request.notes:
        visit.notes = f"{visit.notes}\n{request.notes}" if visit.notes else request.notes
    
    db.commit()
    
    return {
        "success": True,
        "check_out_time": visit.check_out.isoformat(),
        "duration_minutes": visit.duration_minutes,
        "message": "Check-out berhasil"
    }

@app.get("/api/attendance/history/{salesman_id}")
async def get_attendance_history(
    salesman_id: str,
    days: int = 7,
    db: Session = Depends(get_db)
):
    """Get attendance history salesman"""
    
    start_date = datetime.now() - timedelta(days=days)
    
    visits = db.query(SalesVisit).filter(
        and_(
            SalesVisit.salesman_id == salesman_id,
            SalesVisit.check_in >= start_date
        )
    ).order_by(SalesVisit.check_in.desc()).all()
    
    return {
        "salesman_id": salesman_id,
        "period_days": days,
        "total_visits": len(visits),
        "visits": [
            {
                "visit_id": v.id,
                "customer_id": v.customer_id,
                "check_in": v.check_in.isoformat(),
                "check_out": v.check_out.isoformat() if v.check_out else None,
                "duration_minutes": v.duration_minutes,
                "notes": v.notes
            }
            for v in visits
        ]
    }

# ==================== OFFLINE SYNC ====================

@app.post("/api/sync/download")
async def sync_download(request: SyncRequest, db: Session = Depends(get_db)):
    """Download data untuk offline storage (filtered by area)"""
    
    salesman = db.query(User).filter(User.id == request.salesman_id).first()
    if not salesman:
        raise HTTPException(status_code=404, detail="Salesman not found")
    
    # Get salesman's area/territory
    salesman_area = salesman.area if hasattr(salesman, 'area') else None
    
    # Get customers in salesman's area
    customers_query = db.query(Customer)
    if salesman_area:
        customers_query = customers_query.filter(Customer.area == salesman_area)
    
    customers = customers_query.limit(100).all()  # Limit for performance
    
    # Get active products with stock
    products = db.query(Product).filter(
        Product.stock_warehouse > 0
    ).limit(200).all()
    
    # Get recent orders for reference
    recent_orders = db.query(Order).filter(
        and_(
            Order.salesman_id == request.salesman_id,
            Order.created_at >= datetime.now() - timedelta(days=30)
        )
    ).order_by(Order.created_at.desc()).limit(50).all()
    
    return {
        "sync_time": datetime.now().isoformat(),
        "salesman_id": request.salesman_id,
        "data": {
            "customers": [
                {
                    "id": c.id,
                    "name": c.name,
                    "address": c.address,
                    "phone": c.phone,
                    "area": c.area if hasattr(c, 'area') else None,
                    "latitude": c.latitude if hasattr(c, 'latitude') else None,
                    "longitude": c.longitude if hasattr(c, 'longitude') else None,
                    "credit_limit": float(c.credit_limit or 0)
                }
                for c in customers
            ],
            "products": [
                {
                    "id": p.id,
                    "name": p.name,
                    "sku": p.sku,
                    "price": float(p.price or 0),
                    "stock_warehouse": p.stock_warehouse,
                    "stock_vehicle": p.stock_vehicle if hasattr(p, 'stock_vehicle') else 0,
                    "unit": p.unit if hasattr(p, 'unit') else "pcs"
                }
                for p in products
            ],
            "recent_orders": [
                {
                    "id": o.id,
                    "customer_id": o.customer_id,
                    "total_amount": float(o.total_amount or 0),
                    "status": str(o.status or ""),
                    "created_at": o.created_at.isoformat() if o.created_at else None
                }
                for o in recent_orders
            ]
        },
        "stats": {
            "customers_count": len(customers),
            "products_count": len(products),
            "orders_count": len(recent_orders)
        }
    }

@app.post("/api/sync/upload")
async def sync_upload(actions: List[OfflineAction], db: Session = Depends(get_db)):
    """Upload offline actions yang tersimpan di local storage"""
    
    results = []
    
    for action in actions:
        try:
            if action.action_type == "check_in":
                # Process check-in
                visit = SalesVisit(
                    salesman_id=action.data["salesman_id"],
                    customer_id=action.data["customer_id"],
                    check_in=datetime.fromisoformat(action.timestamp),
                    latitude=action.data.get("latitude"),
                    longitude=action.data.get("longitude"),
                    notes=action.data.get("notes"),
                    location_valid=True
                )
                db.add(visit)
                db.commit()
                results.append({"action": "check_in", "status": "success"})
                
            elif action.action_type == "check_out":
                # Process check-out
                visit = db.query(SalesVisit).filter(
                    SalesVisit.id == action.data["visit_id"]
                ).first()
                if visit:
                    visit.check_out = datetime.fromisoformat(action.timestamp)
                    if visit.check_in and visit.check_out:
                        check_in_time: datetime = visit.check_in  # type: ignore
                        check_out_time: datetime = visit.check_out  # type: ignore
                        visit.duration_minutes = int((check_out_time - check_in_time).total_seconds() / 60)
                    db.commit()
                    results.append({"action": "check_out", "status": "success"})
                else:
                    results.append({"action": "check_out", "status": "failed", "reason": "visit not found"})
                    
            elif action.action_type == "order":
                # Process order - implement based on your Order model
                results.append({"action": "order", "status": "pending"})
                
        except Exception as e:
            results.append({"action": action.action_type, "status": "error", "error": str(e)})
    
    return {
        "sync_time": datetime.now().isoformat(),
        "total_actions": len(actions),
        "results": results,
        "success_count": len([r for r in results if r["status"] == "success"])
    }

# ==================== DATA QUERIES ====================

@app.get("/api/data/customers/{salesman_id}")
async def get_customers_by_salesman(salesman_id: str, db: Session = Depends(get_db)):
    """Get customers for specific salesman (filtered by area)"""
    
    salesman = db.query(User).filter(User.id == salesman_id).first()
    if not salesman:
        raise HTTPException(status_code=404, detail="Salesman not found")
    
    area = salesman.area if hasattr(salesman, 'area') else None
    
    customers = db.query(Customer)
    if area:
        customers = customers.filter(Customer.area == area)
    
    customers = customers.all()
    
    return {
        "salesman_id": salesman_id,
        "area": area,
        "count": len(customers),
        "customers": [
            {
                "id": c.id,
                "name": c.name,
                "address": c.address,
                "phone": c.phone
            }
            for c in customers
        ]
    }

@app.get("/api/data/products")
async def get_products(db: Session = Depends(get_db)):
    """Get available products with stock"""
    
    products = db.query(Product).filter(Product.stock_warehouse > 0).all()
    
    return {
        "count": len(products),
        "products": [
            {
                "id": p.id,
                "name": p.name,
                "sku": p.sku,
                "price": float(p.price or 0),
                "stock": p.stock_warehouse
            }
            for p in products
        ]
    }

# ==================== MAIN ====================

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting GAJAH NUSA Attendance Microservice...")
    print("📍 Server: http://localhost:8002")
    print("📚 API Docs: http://localhost:8002/docs")
    print("✅ Offline-First Support Enabled\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8002,
        log_level="info"
    )
