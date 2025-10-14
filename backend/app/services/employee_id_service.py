"""
GAJAH NUSA ERP - Employee ID Management System
Auto-generate Employee ID dengan reuse capability dan history tracking
"""

from enum import Enum
from datetime import datetime, timezone
from typing import Optional, Dict, List, Tuple
from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class UserRole(Enum):
    OWNER = "owner"
    MANAGER = "manager" 
    ADMIN = "admin"
    SUPERVISOR_TOKO = "supervisor_toko"
    SUPERVISOR_PROJECT = "supervisor_project"
    SALES_TOKO = "sales_toko"
    SALES_PROJECT = "sales_project"
    DRIVER = "driver"
    GUDANG = "gudang"

class EmployeeIDGenerator:
    """
    Generator untuk Employee ID dengan format ROLE-BASED PREFIX
    Format: [ROLE_PREFIX][NUMBER]
    
    Contoh:
    - OWN001, OWN002 (Owner)
    - MGR001, MGR002 (Manager) 
    - ADM001, ADM002 (Admin)
    - SPT001, SPT002 (Supervisor Toko)
    - SPP001, SPP002 (Supervisor Project)
    - SLT001, SLT002 (Sales Toko)
    - SLP001, SLP002 (Sales Project)
    - DRV001, DRV002 (Driver)
    - GDG001, GDG002 (Gudang)
    """
    
    ROLE_PREFIXES = {
        UserRole.OWNER: "OWN",
        UserRole.MANAGER: "MGR",
        UserRole.ADMIN: "ADM", 
        UserRole.SUPERVISOR_TOKO: "SPT",
        UserRole.SUPERVISOR_PROJECT: "SPP",
        UserRole.SALES_TOKO: "SLT",
        UserRole.SALES_PROJECT: "SLP",
        UserRole.DRIVER: "DRV",
        UserRole.GUDANG: "GDG"
    }
    
    def __init__(self, db_session):
        self.db = db_session
    
    def generate_employee_id(self, role: UserRole, preferred_name: str) -> str:
        """
        Generate Employee ID otomatis dengan strategi:
        1. Cari ID yang available untuk reuse (dari karyawan yang keluar)
        2. Jika tidak ada, buat ID baru dengan nomor sequential
        3. Update history jika reuse ID
        """
        prefix = self.ROLE_PREFIXES[role]
        
        # 1. Cari available ID untuk reuse
        available_id = self._find_available_id_for_reuse(role)
        
        if available_id:
            # Reuse ID yang tersedia
            self._update_history_for_reused_id(available_id, preferred_name)
            return available_id
        else:
            # Generate ID baru
            return self._generate_new_sequential_id(role)
    
    def _find_available_id_for_reuse(self, role: UserRole) -> Optional[str]:
        """
        Cari ID yang bisa di-reuse dari karyawan yang sudah keluar (is_active=False)
        """
        prefix = self.ROLE_PREFIXES[role]
        
        # Query karyawan yang keluar dengan role yang sama
        former_employees = self.db.query(User).filter(
            User.employee_id.like(f"{prefix}%"),
            User.is_active == False
        ).order_by(User.employee_id).all()
        
        if former_employees:
            # Ambil ID yang paling kecil untuk di-reuse
            return former_employees[0].employee_id
        
        return None
    
    def _generate_new_sequential_id(self, role: UserRole) -> str:
        """
        Generate ID baru dengan nomor sequential
        """
        prefix = self.ROLE_PREFIXES[role]
        
        # Cari nomor tertinggi untuk role ini
        highest_employee = self.db.query(User).filter(
            User.employee_id.like(f"{prefix}%")
        ).order_by(User.employee_id.desc()).first()
        
        if highest_employee:
            # Extract nomor dari ID tertinggi, tambah 1
            current_number = int(highest_employee.employee_id[3:])  # Skip 3 karakter prefix
            new_number = current_number + 1
        else:
            # ID pertama untuk role ini
            new_number = 1
        
        return f"{prefix}{new_number:03d}"  # Format: PREFIX001, PREFIX002, dst.
    
    def _update_history_for_reused_id(self, reused_id: str, new_employee_name: str):
        """
        Update history ketika ID di-reuse oleh karyawan baru
        Strategi nama:
        1. Ganti nama depan dengan nama karyawan baru
        2. Jika nama depan sama, tambah nama kedua
        """
        former_employee = self.db.query(User).filter(
            User.employee_id == reused_id,
            User.is_active == False
        ).first()
        
        if former_employee:
            # Generate nama replacement untuk history
            replacement_name = self._generate_replacement_name(
                former_employee.name, 
                new_employee_name
            )
            
            # Update nama di history
            former_employee.name = replacement_name
            former_employee.departure_note = f"ID reused by {new_employee_name} on {datetime.now(timezone.utc).isoformat()}"
            
            # Create history record
            history_record = EmployeeHistory(
                original_employee_id=reused_id,
                original_name=former_employee.name,
                replacement_name=replacement_name,
                new_employee_name=new_employee_name,
                reuse_date=datetime.now(timezone.utc),
                reason="ID_REUSE"
            )
            
            self.db.add(history_record)
            self.db.commit()
    
    def _generate_replacement_name(self, original_name: str, new_employee_name: str) -> str:
        """
        Generate nama replacement untuk karyawan lama di history
        Rules:
        1. Ganti nama depan dengan nama depan karyawan baru
        2. Jika nama depan sama, tambah nama kedua karyawan baru
        """
        original_parts = original_name.split()
        new_parts = new_employee_name.split()
        
        if len(original_parts) == 0 or len(new_parts) == 0:
            return f"[Former] {original_name}"
        
        original_first = original_parts[0]
        new_first = new_parts[0]
        
        # Jika nama depan sama, tambah nama kedua (jika ada)
        if original_first.lower() == new_first.lower():
            if len(new_parts) > 1:
                replacement_first = f"{new_first} {new_parts[1]}"
            else:
                replacement_first = f"{new_first}_Former"
        else:
            replacement_first = new_first
        
        # Gabungkan dengan sisa nama original
        if len(original_parts) > 1:
            remaining_parts = original_parts[1:]
            return f"{replacement_first} {' '.join(remaining_parts)}"
        else:
            return f"{replacement_first} [Former]"

class EmployeeHistory(Base):
    """
    Table untuk menyimpan history ID reuse
    """
    __tablename__ = "employee_history"
    
    id = Column(Integer, primary_key=True)
    original_employee_id = Column(String(10), nullable=False)
    original_name = Column(String(100), nullable=False)
    replacement_name = Column(String(100), nullable=False)
    new_employee_name = Column(String(100), nullable=False)
    reuse_date = Column(DateTime(timezone=True), nullable=False)
    reason = Column(String(50), nullable=False)  # ID_REUSE, RESTRUCTURE, etc.
    notes = Column(Text)

# Update User model untuk support departure tracking
class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True)
    employee_id = Column(String(10), unique=True, nullable=False)  # OWN001, MGR001, etc.
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    area_type = Column(String(20))
    area_detail = Column(String(100))
    address = Column(Text)
    phone_personal = Column(String(20))
    phone_office = Column(String(20))
    
    # Status tracking
    is_active = Column(Boolean, default=True)
    hired_date = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))
    departure_date = Column(DateTime(timezone=True))
    departure_reason = Column(String(100))
    departure_note = Column(Text)
    
    created_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))

class EmployeeService:
    """
    Service untuk mengelola karyawan dengan auto ID generation
    """
    
    def __init__(self, db_session):
        self.db = db_session
        self.id_generator = EmployeeIDGenerator(db_session)
    
    def create_employee(self, employee_data: dict) -> dict:
        """
        Create karyawan baru dengan auto-generated ID
        """
        # Generate Employee ID otomatis
        role = UserRole(employee_data['role'])
        employee_id = self.id_generator.generate_employee_id(
            role, 
            employee_data['name']
        )
        
        # Create user record
        new_employee = User(
            employee_id=employee_id,
            name=employee_data['name'],
            email=employee_data['email'],
            password_hash=self._hash_password(employee_data['password']),
            role=employee_data['role'],
            area_type=employee_data.get('area_type'),
            area_detail=employee_data.get('area_detail'),
            address=employee_data.get('address'),
            phone_personal=employee_data.get('phone_personal'),
            phone_office=employee_data.get('phone_office')
        )
        
        self.db.add(new_employee)
        self.db.commit()
        
        return {
            "employee_id": employee_id,
            "message": "Employee created successfully",
            "reused_id": self._was_id_reused(employee_id)
        }
    
    def terminate_employee(self, employee_id: str, reason: str, notes: str = "") -> dict:
        """
        Terminate karyawan (set inactive, bukan delete)
        ID akan tersedia untuk reuse
        """
        employee = self.db.query(User).filter(
            User.employee_id == employee_id,
            User.is_active == True
        ).first()
        
        if not employee:
            raise ValueError(f"Active employee with ID {employee_id} not found")
        
        # Set inactive
        employee.is_active = False
        employee.departure_date = datetime.now(timezone.utc)
        employee.departure_reason = reason
        employee.departure_note = notes
        
        self.db.commit()
        
        return {
            "message": f"Employee {employee_id} terminated. ID available for reuse.",
            "departure_date": employee.departure_date.isoformat()
        }
    
    def get_available_ids_for_reuse(self, role: Optional[UserRole] = None) -> List[str]:
        """
        Get list ID yang tersedia untuk reuse
        """
        query = self.db.query(User.employee_id).filter(User.is_active == False)
        
        if role:
            prefix = EmployeeIDGenerator.ROLE_PREFIXES[role]
            query = query.filter(User.employee_id.like(f"{prefix}%"))
        
        return [row.employee_id for row in query.order_by(User.employee_id).all()]
    
    def get_employee_history(self, employee_id: str) -> List[dict]:
        """
        Get history untuk specific employee ID
        """
        history = self.db.query(EmployeeHistory).filter(
            EmployeeHistory.original_employee_id == employee_id
        ).order_by(EmployeeHistory.reuse_date.desc()).all()
        
        return [
            {
                "original_name": h.original_name,
                "replacement_name": h.replacement_name,
                "new_employee_name": h.new_employee_name,
                "reuse_date": h.reuse_date.isoformat(),
                "reason": h.reason,
                "notes": h.notes
            }
            for h in history
        ]
    
    def _was_id_reused(self, employee_id: str) -> bool:
        """
        Check apakah ID ini hasil reuse
        """
        history = self.db.query(EmployeeHistory).filter(
            EmployeeHistory.original_employee_id == employee_id
        ).first()
        
        return history is not None
    
    def _hash_password(self, password: str) -> str:
        """
        Hash password (implementasi sesuai dengan auth_service.py)
        """
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.hash(password)

# Example usage dan testing
if __name__ == "__main__":
    # Contoh penggunaan
    
    # Mock database session untuk testing
    class MockDBSession:
        def __init__(self):
            self.employees = []
            
        def query(self, model):
            return MockQuery()
            
        def add(self, obj):
            self.employees.append(obj)
            
        def commit(self):
            pass
            
    class MockQuery:
        def filter_by(self, **kwargs):
            return self
            
        def first(self):
            return None
            
        def all(self):
            return []
    
    # 1. Create karyawan baru
    db_session = MockDBSession()
    employee_service = EmployeeService(db_session)
    
    # Sales Toko pertama
    result1 = employee_service.create_employee({
        "name": "Budi Santoso",
        "email": "budi@gajahnusa.com", 
        "password": "password123",
        "role": "sales_toko",
        "area_type": "toko",
        "area_detail": "Surabaya"
    })
    print(f"Created: {result1}")  # Output: SLT001
    
    # Sales Toko kedua
    result2 = employee_service.create_employee({
        "name": "Siti Rahayu",
        "email": "siti@gajahnusa.com",
        "password": "password123", 
        "role": "sales_toko",
        "area_type": "toko",
        "area_detail": "Kediri"
    })
    print(f"Created: {result2}")  # Output: SLT002
    
    # 2. Terminate karyawan
    terminate_result = employee_service.terminate_employee(
        "SLT001", 
        "Resignation", 
        "Moving to another city"
    )
    print(f"Terminated: {terminate_result}")
    
    # 3. Create karyawan baru (akan reuse SLT001)
    result3 = employee_service.create_employee({
        "name": "Ahmad Wijaya",  # Nama beda dari Budi
        "email": "ahmad@gajahnusa.com",
        "password": "password123",
        "role": "sales_toko",
        "area_type": "toko", 
        "area_detail": "Surabaya"
    })
    print(f"Created (reused): {result3}")  # Output: SLT001 (reused)
    # History: "Budi Santoso" -> "Ahmad Santoso" di database
    
    # 4. Create dengan nama depan sama
    result4 = employee_service.create_employee({
        "name": "Ahmad Fauzi",  # Nama depan sama: Ahmad
        "email": "ahmad.fauzi@gajahnusa.com",
        "password": "password123",
        "role": "sales_toko",
        "area_type": "toko",
        "area_detail": "Malang"
    })
    print(f"Created: {result4}")  # Output: SLT003
    
    # Jika suatu saat SLT001 keluar lagi dan diganti "Ahmad Budiman":
    # History: "Ahmad Santoso" -> "Ahmad Budiman Santoso" 
    # (nama depan sama, jadi tambah nama kedua)
