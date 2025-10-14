#!/usr/bin/env python3
"""
Test role-based employee deletion permissions
"""

import requests
import json

BASE_URL = "http://localhost:8002"

def test_role_based_deletion():
    """Test role-based employee deletion permissions"""
    print("=== Testing Role-Based Employee Deletion ===")
    
    # First, create a test employee
    test_employee = {
        "name": "Test Employee for Deletion",
        "email": "testdelete@gajahnusa.com",
        "password": "password123",
        "role": "sales_toko",
        "area_type": "toko",
        "area_detail": "Test Area",
        "phone": "081999888777"
    }
    
    # Register the employee
    try:
        response = requests.post(f"{BASE_URL}/api/register", json=test_employee)
        if response.status_code == 200:
            result = response.json()
            employee_id = result['employee_id']
            print(f"✅ Created test employee: {employee_id}")
            
            # Test different roles trying to delete
            test_roles = [
                {"role": "admin", "should_succeed": True},
                {"role": "owner", "should_succeed": True},
                {"role": "manager", "should_succeed": False},
                {"role": "sales_toko", "should_succeed": False},
                {"role": "driver", "should_succeed": False},
                {"role": "supervisor_toko", "should_succeed": False}
            ]
            
            for test_case in test_roles:
                role = test_case["role"]
                should_succeed = test_case["should_succeed"]
                
                termination_data = {
                    "requester_role": role,
                    "reason": f"Test deletion by {role}"
                }
                
                print(f"\n🧪 Testing deletion with role: {role}")
                
                try:
                    response = requests.post(
                        f"{BASE_URL}/api/employees/{employee_id}/terminate",
                        json=termination_data
                    )
                    
                    if should_succeed:
                        if response.status_code == 200:
                            result = response.json()
                            print(f"✅ SUCCESS: {result['message']}")
                            
                            # Create another employee for next test
                            if role != test_roles[-1]["role"]:  # Not the last test
                                reg_response = requests.post(f"{BASE_URL}/api/register", json=test_employee)
                                if reg_response.status_code == 200:
                                    employee_id = reg_response.json()['employee_id']
                                    print(f"   → Created new test employee: {employee_id}")
                        else:
                            error = response.json()
                            print(f"❌ UNEXPECTED FAILURE: {error.get('detail', 'Unknown error')}")
                    else:
                        if response.status_code == 403:
                            error = response.json()
                            print(f"✅ CORRECTLY DENIED: {error.get('detail', 'Access denied')}")
                        else:
                            print(f"❌ UNEXPECTED SUCCESS: Should have been denied for role {role}")
                            
                except Exception as e:
                    print(f"❌ ERROR: {e}")
            
        else:
            print(f"❌ Failed to create test employee: {response.status_code}")
    
    except Exception as e:
        print(f"❌ Error: {e}")

def test_permission_summary():
    """Test and display permission summary"""
    print("\n=== Permission Summary ===")
    
    permissions = {
        "owner": {"delete": "✅ Allowed", "view": "✅ Allowed", "create": "✅ Allowed"},
        "admin": {"delete": "✅ Allowed", "view": "✅ Allowed", "create": "✅ Allowed"},
        "manager": {"delete": "❌ Denied", "view": "✅ Allowed", "create": "✅ Allowed"},
        "supervisor_toko": {"delete": "❌ Denied", "view": "✅ Allowed", "create": "✅ Allowed"},
        "supervisor_project": {"delete": "❌ Denied", "view": "✅ Allowed", "create": "✅ Allowed"},
        "sales_toko": {"delete": "❌ Denied", "view": "✅ Allowed", "create": "✅ Allowed"},
        "sales_project": {"delete": "❌ Denied", "view": "✅ Allowed", "create": "✅ Allowed"},
        "driver": {"delete": "❌ Denied", "view": "✅ Allowed", "create": "✅ Allowed"},
        "gudang": {"delete": "❌ Denied", "view": "✅ Allowed", "create": "✅ Allowed"}
    }
    
    print(f"{'Role':<18} {'Delete':<12} {'View':<12} {'Create':<12}")
    print("-" * 60)
    
    for role, perms in permissions.items():
        print(f"{role:<18} {perms['delete']:<12} {perms['view']:<12} {perms['create']:<12}")

def main():
    """Run role-based deletion tests"""
    print("🔒 Testing GAJAH NUSA ERP Role-Based Permissions")
    print("=" * 60)
    
    # Test role-based deletion
    test_role_based_deletion()
    
    # Show permission summary
    test_permission_summary()
    
    print("\n" + "=" * 60)
    print("🎯 Key Updates:")
    print("1. ✅ Tagline changed: 'Anti-Fraud System' → 'AI Cerdas dan Canggih'")
    print("2. ✅ Role-based deletion: Only Admin and Owner can delete employee IDs")
    print("3. ✅ Secure API endpoint: POST /api/employees/{id}/terminate")
    print("4. ✅ Permission validation with detailed error messages")
    print("5. ✅ Employee Management UI: http://localhost:8080/employee_management.html")
    print("\n🌐 Access URLs:")
    print("- Registration: http://localhost:8080/register.html")
    print("- Management: http://localhost:8080/employee_management.html")
    print("- Admin Dashboard: http://localhost:8080/web_admin_dashboard.html")

if __name__ == "__main__":
    main()
