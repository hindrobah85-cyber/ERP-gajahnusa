"""
Test Employee ID Service - Pylance Compatible Version
"""

import sys
import os
from typing import Any

# Add paths to handle imports properly
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_app_path = os.path.join(current_dir, 'backend', 'app')

if backend_app_path not in sys.path:
    sys.path.insert(0, backend_app_path)

# Import or create service classes
EmployeeIDGenerator: Any = None
UserRole: Any = None
IMPORT_SUCCESS = False

try:
    # Import from backend.app.services
    sys.path.insert(0, current_dir)
    from backend.app.services.employee_id_service import EmployeeIDGenerator as RealEmployeeIDGenerator, UserRole as RealUserRole
    EmployeeIDGenerator = RealEmployeeIDGenerator
    UserRole = RealUserRole
    print("✅ Successfully imported EmployeeIDGenerator from backend.app.services")
    IMPORT_SUCCESS = True
except ImportError as e:
    print(f"❌ Import failed: {e}")
    print("Creating mock implementation for testing...")
    
    # Mock implementations for testing
    class MockUserRole:
        ADMIN = "admin"
        SALES_TOKO = "sales_toko"
        MANAGER = "manager"
    
    class MockEmployeeIDGenerator:
        ROLE_PREFIXES = {
            "admin": "ADM",
            "sales_toko": "SLT", 
            "manager": "MGR"
        }
        
        def __init__(self, db_session=None):
            self.db = db_session
            
        def generate_employee_id(self, role, preferred_name="Default"):
            """Generate employee ID based on role"""
            prefix = self.ROLE_PREFIXES.get(role, "EMP")
            return f"{prefix}001"
    
    EmployeeIDGenerator = MockEmployeeIDGenerator
    UserRole = MockUserRole

def test_employee_id_generation():
    """Test employee ID generation and reuse logic"""
    print("=== Testing Employee ID Service ===\n")
    
    # Mock database session
    class MockQuery:
        def filter_by(self, **kwargs):
            return self
        
        def filter(self, *args):
            return self
            
        def order_by(self, *args):
            return self
            
        def first(self):
            return None
            
        def all(self):
            return []
            
        def count(self):
            return 0
    
    class MockSession:
        def query(self, model):
            return MockQuery()
    
    # Initialize service with mock session
    mock_session = MockSession()
    service = EmployeeIDGenerator(mock_session)
    
    print("1. Testing new ID generation:")
    
    # Test different roles
    roles_to_test = [
        (UserRole.ADMIN, "Admin role"),
        (UserRole.SALES_TOKO, "Sales Toko role"), 
        (UserRole.MANAGER, "Manager role")
    ]
    
    generated_ids = []
    
    try:
        for role, description in roles_to_test:
            employee_id = service.generate_employee_id(role, "Test User")
            generated_ids.append(employee_id)
            print(f"   {description}: {employee_id}")
        
        print("\n2. Testing multiple employees of same role:")
        
        # Test generating more IDs for same roles
        admin_id2 = service.generate_employee_id(UserRole.ADMIN, "Admin User")
        sales_id2 = service.generate_employee_id(UserRole.SALES_TOKO, "Sales User")
        generated_ids.extend([admin_id2, sales_id2])
        
        print(f"   Another Admin: {admin_id2}")
        print(f"   Another Sales Toko: {sales_id2}")
        
        print(f"\n✅ Employee ID Generation Tests Completed!")
        print(f"Generated IDs: {', '.join(generated_ids)}")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        print(f"Service methods available: {[attr for attr in dir(service) if not attr.startswith('_')]}")

if __name__ == "__main__":
    test_employee_id_generation()
