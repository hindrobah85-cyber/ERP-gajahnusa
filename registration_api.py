#!/usr/bin/env python3
"""
GAJAH NUSA ERP - Registration API Backend
Integrates with employee ID service for automatic ID generation
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

# Simple in-memory employee ID service (production would use database)
class EmployeeIDService:
    def __init__(self):
        self.role_prefixes = {
            "owner": "OWN",
            "manager": "MGR", 
            "admin": "ADM",
            "supervisor_toko": "SPT",
            "supervisor_project": "SPP",
            "sales_toko": "SLT",
            "sales_project": "SLP",
            "driver": "DRV",
            "gudang": "GDG"
        }
        self.assigned_ids = set()
        self.released_ids = set()
        self.counters = {}
        self.employees = {}  # Store employee data
        
    def generate_id(self, role: str) -> str:
        """Generate Employee ID for given role"""
        if role not in self.role_prefixes:
            raise ValueError(f"Unknown role: {role}")
            
        prefix = self.role_prefixes[role]
        
        # Check for reusable IDs first
        role_released = [id for id in self.released_ids if id.startswith(prefix)]
        if role_released:
            reuse_id = min(role_released)
            self.released_ids.remove(reuse_id)
            self.assigned_ids.add(reuse_id)
            return reuse_id
        
        # Generate new ID
        if role not in self.counters:
            self.counters[role] = 0
            
        self.counters[role] += 1
        new_id = f"{prefix}{self.counters[role]:03d}"
        self.assigned_ids.add(new_id)
        return new_id
    
    def preview_next_id(self, role: str) -> str:
        """Preview what the next ID would be for a role (without generating)"""
        if role not in self.role_prefixes:
            return "INVALID"
            
        prefix = self.role_prefixes[role]
        
        # Check for reusable IDs first
        role_released = [id for id in self.released_ids if id.startswith(prefix)]
        if role_released:
            return min(role_released)
        
        # Preview new ID
        next_counter = self.counters.get(role, 0) + 1
        return f"{prefix}{next_counter:03d}"

# Initialize services
app = FastAPI(title="GAJAH NUSA ERP - Registration API")
employee_service = EmployeeIDService()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class EmployeeRegistration(BaseModel):
    name: str
    email: str
    password: str
    role: str
    area_type: Optional[str] = None
    area_detail: Optional[str] = None
    phone: Optional[str] = None

class RegistrationResponse(BaseModel):
    employee_id: str
    message: str
    success: bool

class PreviewResponse(BaseModel):
    preview_id: str
    role: str

class TerminationRequest(BaseModel):
    requester_role: str
    reason: Optional[str] = "Administrative action"

class TerminationResponse(BaseModel):
    message: str
    success: bool
    terminated_by: str
    employee_id: str

# API Endpoints
@app.get("/")
async def root():
    return {"message": "GAJAH NUSA ERP Registration API", "status": "active"}

@app.get("/api/employee-id/preview/{role}")
async def preview_employee_id(role: str):
    """Preview the next employee ID for a given role"""
    try:
        preview_id = employee_service.preview_next_id(role)
        return PreviewResponse(preview_id=preview_id, role=role)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/register")
async def register_employee(registration: EmployeeRegistration):
    """Register a new employee with auto-generated ID"""
    try:
        # Generate employee ID
        employee_id = employee_service.generate_id(registration.role)
        
        # Store employee data (in production, save to database)
        employee_service.employees[employee_id] = {
            "employee_id": employee_id,
            "name": registration.name,
            "email": registration.email,
            "role": registration.role,
            "area_type": registration.area_type,
            "area_detail": registration.area_detail,
            "phone": registration.phone,
            "status": "active"
        }
        
        return RegistrationResponse(
            employee_id=employee_id,
            message=f"Employee registered successfully with ID: {employee_id}",
            success=True
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/employees")
async def get_all_employees():
    """Get all registered employees"""
    return {"employees": list(employee_service.employees.values())}

@app.get("/api/employees/{employee_id}")
async def get_employee(employee_id: str):
    """Get specific employee by ID"""
    if employee_id not in employee_service.employees:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee_service.employees[employee_id]

@app.post("/api/employees/{employee_id}/terminate")
async def terminate_employee_secure(employee_id: str, termination_request: TerminationRequest):
    """Secure employee termination with role-based authorization"""
    
    # Check permissions - only admin and owner can delete
    allowed_roles = ["admin", "owner"]
    requester_role = termination_request.requester_role.lower()
    
    if requester_role not in allowed_roles:
        raise HTTPException(
            status_code=403, 
            detail=f"❌ Access Denied: Only Admin and Owner can delete employee IDs. Your role: '{requester_role}'"
        )
    
    if employee_id not in employee_service.employees:
        raise HTTPException(status_code=404, detail=f"Employee {employee_id} not found")
    
    # Get employee info before termination
    employee_info = employee_service.employees[employee_id]
    
    # Mark as terminated
    employee_service.employees[employee_id]["status"] = "terminated"
    employee_service.employees[employee_id]["terminated_by"] = requester_role
    employee_service.employees[employee_id]["termination_reason"] = termination_request.reason
    
    # Release ID for reuse
    employee_service.assigned_ids.discard(employee_id)
    employee_service.released_ids.add(employee_id)
    
    return TerminationResponse(
        message=f"✅ Employee {employee_id} ({employee_info['name']}) terminated successfully by {requester_role}",
        success=True,
        terminated_by=requester_role,
        employee_id=employee_id
    )

if __name__ == "__main__":
    print("🚀 Starting GAJAH NUSA ERP Registration API...")
    print("📋 Employee ID Service initialized")
    print("🌐 API will be available at: http://localhost:8002")
    print("📖 Documentation: http://localhost:8002/docs")
    uvicorn.run(app, host="0.0.0.0", port=8002)
