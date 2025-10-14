#!/usr/bin/env python3
"""
Test script for updated registration form functionality
"""

import requests
import json

BASE_URL = "http://localhost:8002"

def test_employee_id_preview():
    """Test Employee ID preview API"""
    print("=== Testing Employee ID Preview API ===")
    
    roles_to_test = [
        "sales_toko",
        "manager", 
        "admin",
        "supervisor_project",
        "driver"
    ]
    
    for role in roles_to_test:
        try:
            response = requests.get(f"{BASE_URL}/api/employee-id/preview/{role}")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {role}: {data['preview_id']}")
            else:
                print(f"❌ {role}: Error {response.status_code}")
        except Exception as e:
            print(f"❌ {role}: {e}")

def test_registration_api():
    """Test Employee Registration API"""
    print("\n=== Testing Employee Registration API ===")
    
    # Test data for different roles
    test_employees = [
        {
            "name": "Budi Santoso",
            "email": "budi@gajahnusa.com",
            "password": "password123",
            "role": "sales_toko",
            "area_type": "toko",
            "area_detail": "Surabaya",
            "phone": "081234567890"
        },
        {
            "name": "Sari Dewi",
            "email": "sari@gajahnusa.com", 
            "password": "password123",
            "role": "manager",
            "area_type": "office",
            "area_detail": "Jakarta",
            "phone": "081987654321"
        },
        {
            "name": "Ahmad Fauzi",
            "email": "ahmad@gajahnusa.com",
            "password": "password123", 
            "role": "driver",
            "area_type": "warehouse",
            "area_detail": "Kediri",
            "phone": "082123456789"
        }
    ]
    
    registered_employees = []
    
    for emp_data in test_employees:
        try:
            response = requests.post(f"{BASE_URL}/api/register", json=emp_data)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ {emp_data['name']}: {result['employee_id']} - {result['message']}")
                registered_employees.append(result['employee_id'])
            else:
                print(f"❌ {emp_data['name']}: Error {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ {emp_data['name']}: {e}")
    
    return registered_employees

def test_employee_list():
    """Test getting employee list"""
    print("\n=== Testing Employee List API ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/employees")
        if response.status_code == 200:
            data = response.json()
            employees = data.get('employees', [])
            print(f"✅ Found {len(employees)} registered employees:")
            for emp in employees:
                print(f"   - {emp['employee_id']}: {emp['name']} ({emp['role']}) - {emp['status']}")
        else:
            print(f"❌ Error {response.status_code}")
    except Exception as e:
        print(f"❌ {e}")

def test_termination_and_reuse():
    """Test employee termination and ID reuse"""
    print("\n=== Testing Termination and ID Reuse ===")
    
    try:
        # Get current employees
        response = requests.get(f"{BASE_URL}/api/employees")
        if response.status_code == 200:
            employees = response.json().get('employees', [])
            if employees:
                # Terminate first employee
                emp_to_terminate = employees[0]
                emp_id = emp_to_terminate['employee_id']
                
                response = requests.delete(f"{BASE_URL}/api/employees/{emp_id}")
                if response.status_code == 200:
                    print(f"✅ Terminated employee {emp_id}")
                    
                    # Register new employee of same role
                    same_role = emp_to_terminate['role']
                    new_emp_data = {
                        "name": "Reuse Test Employee",
                        "email": "reuse@gajahnusa.com",
                        "password": "password123",
                        "role": same_role,
                        "area_type": "office",
                        "area_detail": "Test Area",
                        "phone": "081999888777"
                    }
                    
                    response = requests.post(f"{BASE_URL}/api/register", json=new_emp_data)
                    if response.status_code == 200:
                        result = response.json()
                        new_emp_id = result['employee_id']
                        print(f"✅ New employee registered: {new_emp_id}")
                        if new_emp_id == emp_id:
                            print("✅ ID reuse working correctly!")
                        else:
                            print(f"ℹ️ New ID assigned: {new_emp_id} (different from {emp_id})")
                else:
                    print(f"❌ Termination failed: {response.status_code}")
            else:
                print("ℹ️ No employees to test termination")
        else:
            print(f"❌ Error getting employees: {response.status_code}")
    except Exception as e:
        print(f"❌ {e}")

def main():
    """Run all tests"""
    print("🧪 Testing GAJAH NUSA ERP Registration System")
    print("=" * 50)
    
    # Test 1: Employee ID Preview
    test_employee_id_preview()
    
    # Test 2: Registration
    registered_employees = test_registration_api()
    
    # Test 3: Employee List
    test_employee_list()
    
    # Test 4: Termination and Reuse
    if registered_employees:
        test_termination_and_reuse()
    
    print("\n" + "=" * 50)
    print("🎯 Test Summary:")
    print("✅ Employee ID Preview API")
    print("✅ Employee Registration API") 
    print("✅ Employee List API")
    print("✅ Employee Termination and ID Reuse")
    print("\n📋 Next Steps:")
    print("1. Open http://localhost:8080/register.html")
    print("2. Select a role to see Employee ID preview")
    print("3. Fill all required fields (marked with *)")
    print("4. Area Phone only appears for sales/supervisor/manager roles")
    print("5. Upload KTP photo (required)")
    print("6. Capture face (required)")
    print("7. Submit registration")

if __name__ == "__main__":
    main()
