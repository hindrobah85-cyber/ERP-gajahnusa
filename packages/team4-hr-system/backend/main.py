from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
import sqlite3
import jwt
from passlib.context import CryptContext

app = FastAPI(title="Gajah Nusa HR System API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3004"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "gajah-nusa-hr-secret-key-2025"
ALGORITHM = "HS256"

# Database
def get_db():
    conn = sqlite3.connect('hr_system.db')
    conn.row_factory = sqlite3.Row
    return conn

# Pydantic Models
class LoginRequest(BaseModel):
    username: str
    password: str

class Employee(BaseModel):
    id: Optional[int] = None
    employeeId: str
    name: str
    email: str
    phone: str
    department: str
    position: str
    joinDate: str
    status: str = "Active"
    salary: float

class AttendanceRecord(BaseModel):
    id: Optional[int] = None
    employeeId: str
    date: str
    checkIn: str
    checkOut: Optional[str] = None
    status: str
    workHours: float = 0

class PayrollRecord(BaseModel):
    id: Optional[int] = None
    employeeId: str
    month: str
    year: int
    basicSalary: float
    allowances: float = 0
    deductions: float = 0
    netSalary: float
    status: str = "pending"

class LeaveRequest(BaseModel):
    id: Optional[int] = None
    employeeId: str
    leaveType: str
    startDate: str
    endDate: str
    reason: str
    status: str = "pending"

class PerformanceReview(BaseModel):
    id: Optional[int] = None
    employeeId: str
    reviewDate: str
    rating: int
    comments: str
    reviewerId: str

# Initialize Database
def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            email TEXT
        )
    ''')
    
    # Employees table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employeeId TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            department TEXT,
            position TEXT,
            joinDate TEXT,
            status TEXT DEFAULT 'Active',
            salary REAL
        )
    ''')
    
    # Attendance table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employeeId TEXT NOT NULL,
            date TEXT NOT NULL,
            checkIn TEXT NOT NULL,
            checkOut TEXT,
            status TEXT,
            workHours REAL DEFAULT 0,
            FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
        )
    ''')
    
    # Payroll table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS payroll (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employeeId TEXT NOT NULL,
            month TEXT NOT NULL,
            year INTEGER NOT NULL,
            basicSalary REAL,
            allowances REAL DEFAULT 0,
            deductions REAL DEFAULT 0,
            netSalary REAL,
            status TEXT DEFAULT 'pending',
            FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
        )
    ''')
    
    # Leave requests table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS leave_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employeeId TEXT NOT NULL,
            leaveType TEXT NOT NULL,
            startDate TEXT NOT NULL,
            endDate TEXT NOT NULL,
            reason TEXT,
            status TEXT DEFAULT 'pending',
            FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
        )
    ''')
    
    # Performance reviews table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS performance_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employeeId TEXT NOT NULL,
            reviewDate TEXT NOT NULL,
            rating INTEGER,
            comments TEXT,
            reviewerId TEXT,
            FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
        )
    ''')
    
    # Insert default admin user
    hashed_password = pwd_context.hash("admin123")
    try:
        cursor.execute(
            "INSERT INTO users (username, password, name, role, email) VALUES (?, ?, ?, ?, ?)",
            ("admin", hashed_password, "HR Administrator", "admin", "admin@gajahnusa.com")
        )
    except sqlite3.IntegrityError:
        pass  # User already exists
    
    # Insert sample employees
    sample_employees = [
        ("EMP001", "Budi Santoso", "budi@gajahnusa.com", "081234567890", "Sales", "Sales Manager", "2023-01-15", "Active", 12000000),
        ("EMP002", "Siti Rahayu", "siti@gajahnusa.com", "081234567891", "Logistics", "Warehouse Supervisor", "2023-02-20", "Active", 9000000),
        ("EMP003", "Ahmad Yani", "ahmad@gajahnusa.com", "081234567892", "Finance", "Accountant", "2023-03-10", "Active", 10000000),
        ("EMP004", "Dewi Kusuma", "dewi@gajahnusa.com", "081234567893", "HR", "HR Specialist", "2023-04-05", "Active", 8500000),
        ("EMP005", "Eko Prasetyo", "eko@gajahnusa.com", "081234567894", "Sales", "Sales Representative", "2023-05-12", "Active", 7000000),
    ]
    
    for emp in sample_employees:
        try:
            cursor.execute(
                "INSERT INTO employees (employeeId, name, email, phone, department, position, joinDate, status, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                emp
            )
        except sqlite3.IntegrityError:
            pass
    
    conn.commit()
    conn.close()

# Auth endpoints
@app.post("/api/auth/login")
async def login(credentials: LoginRequest):
    conn = get_db()
    cursor = conn.cursor()
    
    user = cursor.execute(
        "SELECT * FROM users WHERE username = ?",
        (credentials.username,)
    ).fetchone()
    
    conn.close()
    
    if not user or not pwd_context.verify(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = jwt.encode(
        {"sub": user['username'], "role": user['role']},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    
    return {
        "token": token,
        "user": {
            "id": user['id'],
            "username": user['username'],
            "name": user['name'],
            "role": user['role'],
            "email": user['email']
        }
    }

# Employee endpoints
@app.get("/api/employees")
async def get_employees():
    conn = get_db()
    cursor = conn.cursor()
    employees = cursor.execute("SELECT * FROM employees").fetchall()
    conn.close()
    return [dict(emp) for emp in employees]

@app.get("/api/employees/{employee_id}")
async def get_employee(employee_id: int):
    conn = get_db()
    cursor = conn.cursor()
    employee = cursor.execute("SELECT * FROM employees WHERE id = ?", (employee_id,)).fetchone()
    conn.close()
    
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return dict(employee)

@app.post("/api/employees")
async def create_employee(employee: Employee):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        "INSERT INTO employees (employeeId, name, email, phone, department, position, joinDate, status, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (employee.employeeId, employee.name, employee.email, employee.phone, employee.department, employee.position, employee.joinDate, employee.status, employee.salary)
    )
    
    conn.commit()
    employee_id = cursor.lastrowid
    conn.close()
    
    return {"id": employee_id, "message": "Employee created successfully"}

@app.put("/api/employees/{employee_id}")
async def update_employee(employee_id: int, employee: Employee):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        "UPDATE employees SET name=?, email=?, phone=?, department=?, position=?, status=?, salary=? WHERE id=?",
        (employee.name, employee.email, employee.phone, employee.department, employee.position, employee.status, employee.salary, employee_id)
    )
    
    conn.commit()
    conn.close()
    
    return {"message": "Employee updated successfully"}

# Attendance endpoints
@app.post("/api/attendance/check-in")
async def check_in(data: dict):
    conn = get_db()
    cursor = conn.cursor()
    
    employee_id = data.get('employeeId')
    now = datetime.now()
    date_str = now.strftime('%Y-%m-%d')
    time_str = now.strftime('%H:%M:%S')
    
    # Check if already checked in today
    existing = cursor.execute(
        "SELECT * FROM attendance WHERE employeeId = ? AND date = ?",
        (employee_id, date_str)
    ).fetchone()
    
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Already checked in today")
    
    # Determine status (late if after 08:30)
    status = "Late" if now.hour > 8 or (now.hour == 8 and now.minute > 30) else "Present"
    
    cursor.execute(
        "INSERT INTO attendance (employeeId, date, checkIn, status) VALUES (?, ?, ?, ?)",
        (employee_id, date_str, time_str, status)
    )
    
    conn.commit()
    conn.close()
    
    return {"message": "Check-in successful", "time": time_str, "status": status}

@app.post("/api/attendance/check-out")
async def check_out(data: dict):
    conn = get_db()
    cursor = conn.cursor()
    
    employee_id = data.get('employeeId')
    now = datetime.now()
    date_str = now.strftime('%Y-%m-%d')
    time_str = now.strftime('%H:%M:%S')
    
    # Find today's check-in record
    record = cursor.execute(
        "SELECT * FROM attendance WHERE employeeId = ? AND date = ? AND checkOut IS NULL",
        (employee_id, date_str)
    ).fetchone()
    
    if not record:
        conn.close()
        raise HTTPException(status_code=400, detail="No check-in record found")
    
    # Calculate work hours
    check_in_time = datetime.strptime(f"{date_str} {record['checkIn']}", '%Y-%m-%d %H:%M:%S')
    check_out_time = now
    work_hours = (check_out_time - check_in_time).total_seconds() / 3600
    
    cursor.execute(
        "UPDATE attendance SET checkOut = ?, workHours = ? WHERE id = ?",
        (time_str, round(work_hours, 2), record['id'])
    )
    
    conn.commit()
    conn.close()
    
    return {"message": "Check-out successful", "time": time_str, "workHours": round(work_hours, 2)}

@app.get("/api/attendance/report")
async def get_attendance_report(start_date: str, end_date: str):
    conn = get_db()
    cursor = conn.cursor()
    
    records = cursor.execute(
        """
        SELECT a.*, e.name as employeeName 
        FROM attendance a 
        JOIN employees e ON a.employeeId = e.employeeId 
        WHERE a.date BETWEEN ? AND ?
        ORDER BY a.date DESC, a.checkIn DESC
        """,
        (start_date, end_date)
    ).fetchall()
    
    conn.close()
    return [dict(record) for record in records]

@app.get("/api/attendance/today")
async def get_today_report():
    today = date.today().isoformat()
    conn = get_db()
    cursor = conn.cursor()
    
    records = cursor.execute(
        """
        SELECT a.*, e.name as employeeName 
        FROM attendance a 
        JOIN employees e ON a.employeeId = e.employeeId 
        WHERE a.date = ?
        ORDER BY a.checkIn DESC
        """,
        (today,)
    ).fetchall()
    
    present_count = len(records)
    
    conn.close()
    
    return {
        "present": present_count,
        "recent": [dict(record) for record in records[:10]]
    }

# Payroll endpoints
@app.get("/api/payroll")
async def get_payroll():
    conn = get_db()
    cursor = conn.cursor()
    
    records = cursor.execute(
        """
        SELECT p.*, e.name as employeeName 
        FROM payroll p 
        JOIN employees e ON p.employeeId = e.employeeId 
        ORDER BY p.year DESC, p.month DESC
        """
    ).fetchall()
    
    conn.close()
    return [dict(record) for record in records]

@app.post("/api/payroll/generate")
async def generate_payroll(data: dict):
    conn = get_db()
    cursor = conn.cursor()
    
    month = data.get('month', 1)
    year = data.get('year', 2025)
    
    # Get all active employees
    employees = cursor.execute("SELECT * FROM employees WHERE status = 'Active'").fetchall()
    
    months = ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December']
    month_name = months[month - 1]
    
    for emp in employees:
        # Calculate allowances and deductions (simplified)
        basic_salary = emp['salary']
        allowances = basic_salary * 0.2  # 20% allowances
        deductions = basic_salary * 0.1  # 10% deductions
        net_salary = basic_salary + allowances - deductions
        
        # Check if payroll already exists
        existing = cursor.execute(
            "SELECT * FROM payroll WHERE employeeId = ? AND month = ? AND year = ?",
            (emp['employeeId'], month_name, year)
        ).fetchone()
        
        if not existing:
            cursor.execute(
                "INSERT INTO payroll (employeeId, month, year, basicSalary, allowances, deductions, netSalary, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (emp['employeeId'], month_name, year, basic_salary, allowances, deductions, net_salary, 'pending')
            )
    
    conn.commit()
    conn.close()
    
    return {"message": "Payroll generated successfully"}

@app.put("/api/payroll/{payroll_id}/approve")
async def approve_payroll(payroll_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("UPDATE payroll SET status = 'approved' WHERE id = ?", (payroll_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Payroll approved"}

@app.put("/api/payroll/{payroll_id}/process")
async def process_payroll(payroll_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("UPDATE payroll SET status = 'processed' WHERE id = ?", (payroll_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Payroll processed"}

# Leave endpoints
@app.get("/api/leave")
async def get_leave_requests():
    conn = get_db()
    cursor = conn.cursor()
    
    requests = cursor.execute(
        """
        SELECT l.*, e.name as employeeName 
        FROM leave_requests l 
        JOIN employees e ON l.employeeId = e.employeeId 
        ORDER BY l.startDate DESC
        """
    ).fetchall()
    
    conn.close()
    return [dict(req) for req in requests]

@app.post("/api/leave")
async def create_leave_request(leave: LeaveRequest):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        "INSERT INTO leave_requests (employeeId, leaveType, startDate, endDate, reason, status) VALUES (?, ?, ?, ?, ?, ?)",
        (leave.employeeId, leave.leaveType, leave.startDate, leave.endDate, leave.reason, leave.status)
    )
    
    conn.commit()
    conn.close()
    
    return {"message": "Leave request created"}

@app.put("/api/leave/{leave_id}/approve")
async def approve_leave(leave_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("UPDATE leave_requests SET status = 'approved' WHERE id = ?", (leave_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Leave approved"}

@app.put("/api/leave/{leave_id}/reject")
async def reject_leave(leave_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("UPDATE leave_requests SET status = 'rejected' WHERE id = ?", (leave_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Leave rejected"}

# Performance endpoints
@app.get("/api/performance")
async def get_performance_reviews():
    conn = get_db()
    cursor = conn.cursor()
    
    reviews = cursor.execute(
        """
        SELECT p.*, e.name as employeeName 
        FROM performance_reviews p 
        JOIN employees e ON p.employeeId = e.employeeId 
        ORDER BY p.reviewDate DESC
        """
    ).fetchall()
    
    conn.close()
    return [dict(review) for review in reviews]

@app.post("/api/performance")
async def create_performance_review(review: PerformanceReview):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        "INSERT INTO performance_reviews (employeeId, reviewDate, rating, comments, reviewerId) VALUES (?, ?, ?, ?, ?)",
        (review.employeeId, review.reviewDate, review.rating, review.comments, review.reviewerId)
    )
    
    conn.commit()
    conn.close()
    
    return {"message": "Performance review created"}

@app.on_event("startup")
async def startup_event():
    init_db()
    print("✅ HR System API initialized on http://localhost:8004")
    print("📊 Default admin credentials: admin / admin123")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
