"""
Test Employee ID Service - Final Clean Version
This version uses absolute imports that Pylance can understand
"""

import sys
import os
from pathlib import Path

# Add the backend/app directory to Python path
project_root = Path(__file__).parent
backend_app_path = project_root / "backend" / "app"
sys.path.insert(0, str(backend_app_path))

# Now import using the proper path structure
from services.employee_id_service import EmployeeIDGenerator, UserRole

def test_employee_id_generation():
    """Test employee ID generation with real service"""
    print("=== Testing Employee ID Service ===\n")
    
    # Mock database session for testing
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
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_employee_id_generation()
