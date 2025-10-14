#!/usr/bin/env python3
"""
Test registration API functionality
"""
import requests
import json

def test_api():
    base_url = "http://localhost:8002"
    
    print("🔍 Testing GAJAH NUSA Registration API...")
    
    # Test 1: Check API status
    print("\n1. Testing API status:")
    try:
        response = requests.get(f"{base_url}/")
        print(f"   Status: {response.status_code}")
        print(f"   Message: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
        return
    
    # Test 2: Preview employee IDs for different roles
    print("\n2. Testing ID preview:")
    roles = ["admin", "sales_toko", "manager", "supervisor_toko"]
    
    for role in roles:
        try:
            response = requests.get(f"{base_url}/api/employee-id/preview/{role}")
            if response.status_code == 200:
                data = response.json()
                print(f"   {role}: {data['preview_id']}")
            else:
                print(f"   {role}: Error {response.status_code}")
        except Exception as e:
            print(f"   {role}: Error - {e}")
    
    # Test 3: Register employees
    print("\n3. Testing employee registration:")
    
    test_employees = [
        {
            "name": "Budi Santoso",
            "email": "budi@gajahnusa.com",
            "password": "password123",
            "role": "admin",
            "area_type": "kantor",
            "area_detail": "Surabaya",
            "phone": "081234567890"
        },
        {
            "name": "Siti Nurhaliza",
            "email": "siti@gajahnusa.com", 
            "password": "password123",
            "role": "sales_toko",
            "area_type": "toko",
            "area_detail": "Kediri",
            "phone": "081234567891"
        },
        {
            "name": "Ahmad Wijaya",
            "email": "ahmad@gajahnusa.com",
            "password": "password123", 
            "role": "sales_toko",
            "area_type": "toko",
            "area_detail": "Malang",
            "phone": "081234567892"
        }
    ]
    
    for i, employee in enumerate(test_employees, 1):
        try:
            response = requests.post(f"{base_url}/api/register", 
                                   json=employee,
                                   headers={"Content-Type": "application/json"})
            
            if response.status_code == 200:
                result = response.json()
                print(f"   Employee {i}: {result['employee_id']} - {employee['name']}")
            else:
                print(f"   Employee {i}: Error {response.status_code} - {response.text}")
        except Exception as e:
            print(f"   Employee {i}: Error - {e}")
    
    # Test 4: Get all employees
    print("\n4. Testing employee list:")
    try:
        response = requests.get(f"{base_url}/api/employees")
        if response.status_code == 200:
            employees = response.json()["employees"]
            print(f"   Total registered employees: {len(employees)}")
            for emp in employees:
                print(f"   - {emp['employee_id']}: {emp['name']} ({emp['role']})")
        else:
            print(f"   Error: {response.status_code}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 5: Test ID reuse
    print("\n5. Testing ID reuse:")
    try:
        # Terminate an employee
        response = requests.delete(f"{base_url}/api/employees/ADM001")
        if response.status_code == 200:
            print("   ADM001 terminated successfully")
            
            # Register new employee (should reuse ADM001)
            new_employee = {
                "name": "Dewi Sartika",
                "email": "dewi@gajahnusa.com",
                "password": "password123",
                "role": "admin",
                "area_type": "kantor",
                "area_detail": "Surabaya"
            }
            
            response = requests.post(f"{base_url}/api/register", json=new_employee)
            if response.status_code == 200:
                result = response.json()
                print(f"   New admin registered: {result['employee_id']} (should be ADM001 - reused)")
            else:
                print(f"   Registration error: {response.status_code}")
        else:
            print(f"   Termination error: {response.status_code}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n✅ API Test Complete!")
    print("🌐 You can now test the registration form at: http://localhost:8003/register.html")
    print("📖 API Documentation: http://localhost:8002/docs")

if __name__ == "__main__":
    test_api()
