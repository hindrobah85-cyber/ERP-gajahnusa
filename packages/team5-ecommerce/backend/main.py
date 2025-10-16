from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import sqlite3
import jwt
import hashlib

app = FastAPI(title="Gajah Nusa E-commerce API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3005"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "gajah-nusa-ecommerce-secret-2025"
ALGORITHM = "HS256"

# Database
def get_db():
    conn = sqlite3.connect('ecommerce.db')
    conn.row_factory = sqlite3.Row
    return conn

# Pydantic Models
class Product(BaseModel):
    id: Optional[int] = None
    name: str
    description: str
    price: float
    category: str
    stock: int
    image: Optional[str] = None
    unit: str = "pcs"

class Customer(BaseModel):
    id: Optional[int] = None
    email: EmailStr
    password: Optional[str] = None
    name: str
    phone: str
    address: str

class CartItem(BaseModel):
    productId: int
    quantity: int

class Order(BaseModel):
    id: Optional[int] = None
    customerId: int
    items: List[CartItem]
    totalAmount: float
    status: str = "pending"
    shippingAddress: str
    paymentMethod: str

class OrderResponse(BaseModel):
    id: int
    orderNumber: str
    customerId: int
    customerName: str
    totalAmount: float
    status: str
    createdAt: str
    items: List[dict]

# Initialize Database
def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Products table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            category TEXT,
            stock INTEGER DEFAULT 0,
            image TEXT,
            unit TEXT DEFAULT 'pcs',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Customers table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Orders table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orderNumber TEXT UNIQUE NOT NULL,
            customerId INTEGER NOT NULL,
            totalAmount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            shippingAddress TEXT,
            paymentMethod TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customerId) REFERENCES customers(id)
        )
    ''')
    
    # Order items table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orderId INTEGER NOT NULL,
            productId INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (orderId) REFERENCES orders(id),
            FOREIGN KEY (productId) REFERENCES products(id)
        )
    ''')
    
    # Insert sample products
    sample_products = [
        ("Portland Cement 50kg", "High quality Portland cement for construction", 85000, "cement", 500, None, "bag"),
        ("Red Brick (Per 1000)", "Standard red brick for walls", 750000, "bricks", 200, None, "unit"),
        ("Steel Rebar 10mm (12m)", "Reinforcement steel bar", 125000, "steel", 1000, None, "pcs"),
        ("Ceramic Tiles 40x40cm", "Glossy ceramic floor tiles", 45000, "tiles", 800, None, "m2"),
        ("White Paint 20L", "Interior/exterior white paint", 350000, "paint", 300, None, "can"),
        ("PVC Pipe 3 inch (4m)", "Water pipe PVC", 95000, "plumbing", 450, None, "pcs"),
        ("Sand (1 Cubic Meter)", "Clean construction sand", 180000, "materials", 100, None, "m3"),
        ("Gravel (1 Cubic Meter)", "Construction gravel", 220000, "materials", 150, None, "m3"),
        ("Concrete Mix 40kg", "Ready mix concrete", 65000, "cement", 600, None, "bag"),
        ("Hollow Brick (Per 1000)", "Lightweight hollow brick", 850000, "bricks", 180, None, "unit"),
        ("Wire Mesh 2.1x5.4m", "Construction wire mesh", 185000, "steel", 250, None, "sheet"),
        ("Roof Tiles Premium", "Clay roof tiles", 12000, "tiles", 2000, None, "pcs"),
        ("Wall Paint 5L", "Interior wall paint various colors", 125000, "paint", 400, None, "can"),
        ("Copper Pipe 1/2 inch", "Water pipe copper", 145000, "plumbing", 200, None, "meter"),
        ("Marble Tiles 60x60cm", "Premium marble tiles", 185000, "tiles", 300, None, "m2"),
        ("Angle Iron 40x40mm", "Steel angle bar", 95000, "steel", 350, None, "pcs"),
    ]
    
    for prod in sample_products:
        try:
            cursor.execute(
                "INSERT INTO products (name, description, price, category, stock, image, unit) VALUES (?, ?, ?, ?, ?, ?, ?)",
                prod
            )
        except sqlite3.IntegrityError:
            pass
    
    conn.commit()
    conn.close()

# Auth Helper
def get_current_customer(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("customerId")
    except:
        return None

# Products Endpoints
@app.get("/api/products")
async def get_products(category: Optional[str] = None, search: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    
    query = "SELECT * FROM products WHERE 1=1"
    params = []
    
    if category:
        query += " AND category = ?"
        params.append(category)
    
    if search:
        query += " AND (name LIKE ? OR description LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
    
    query += " ORDER BY name"
    
    products = cursor.execute(query, params).fetchall()
    conn.close()
    
    return [dict(p) for p in products]

@app.get("/api/products/{product_id}")
async def get_product(product_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    product = cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    conn.close()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return dict(product)

@app.get("/api/categories")
async def get_categories():
    conn = get_db()
    cursor = conn.cursor()
    
    categories = cursor.execute(
        "SELECT DISTINCT category, COUNT(*) as count FROM products GROUP BY category"
    ).fetchall()
    conn.close()
    
    return [{"name": c['category'], "count": c['count']} for c in categories]

# Customer Endpoints
@app.post("/api/customers/")
async def create_customer(customer: Customer):
    conn = get_db()
    cursor = conn.cursor()
    
    # Simple customer creation (no password for guest checkout)
    try:
        cursor.execute(
            "INSERT INTO customers (email, password, name, phone, address) VALUES (?, ?, ?, ?, ?)",
            (customer.email, "guest", customer.name, customer.phone, customer.address)
        )
        conn.commit()
        customer_id = cursor.lastrowid
        conn.close()
        
        return {
            "id": customer_id,
            "email": customer.email,
            "name": customer.name,
            "phone": customer.phone,
            "address": customer.address
        }
    except sqlite3.IntegrityError:
        # Customer already exists, return existing
        existing = cursor.execute(
            "SELECT * FROM customers WHERE email = ?",
            (customer.email,)
        ).fetchone()
        conn.close()
        return dict(existing)

@app.get("/api/customers/email/{email}")
async def get_customer_by_email(email: str):
    conn = get_db()
    cursor = conn.cursor()
    
    customer = cursor.execute(
        "SELECT * FROM customers WHERE email = ?",
        (email,)
    ).fetchone()
    
    conn.close()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return dict(customer)

@app.post("/api/customers/register")
async def register_customer(customer: Customer):
    conn = get_db()
    cursor = conn.cursor()
    
    # Hash password
    password = customer.password or "guest"
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    try:
        cursor.execute(
            "INSERT INTO customers (email, password, name, phone, address) VALUES (?, ?, ?, ?, ?)",
            (customer.email, password_hash, customer.name, customer.phone, customer.address)
        )
        conn.commit()
        customer_id = cursor.lastrowid
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    
    conn.close()
    
    # Generate token
    token = jwt.encode({"customerId": customer_id, "email": customer.email}, SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        "token": token,
        "customer": {
            "id": customer_id,
            "email": customer.email,
            "name": customer.name
        }
    }

@app.post("/api/customers/login")
async def login_customer(email: EmailStr, password: str):
    conn = get_db()
    cursor = conn.cursor()
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    customer = cursor.execute(
        "SELECT * FROM customers WHERE email = ? AND password = ?",
        (email, password_hash)
    ).fetchone()
    
    conn.close()
    
    if not customer:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = jwt.encode({"customerId": customer['id'], "email": customer['email']}, SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        "token": token,
        "customer": {
            "id": customer['id'],
            "email": customer['email'],
            "name": customer['name']
        }
    }

# Orders Endpoints
@app.post("/api/orders/")
async def create_order_simple(order_data: dict):
    """Create order without authentication (for guest checkout)"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Generate order number
    order_number = f"ORD-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Create order
    cursor.execute(
        """INSERT INTO orders (
            order_number, customer_id, subtotal, tax, shipping, total, 
            status, payment_method, shipping_address, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            order_number, 
            order_data['customer_id'],
            order_data['subtotal'],
            order_data['tax'],
            order_data['shipping'],
            order_data['total'],
            order_data.get('status', 'pending'),
            order_data['payment_method'],
            order_data['shipping_address'],
            order_data.get('notes', ''),
            datetime.now().isoformat(),
            datetime.now().isoformat()
        )
    )
    order_id = cursor.lastrowid
    
    # Add order items and update stock
    for item in order_data['items']:
        # Get product
        product = cursor.execute("SELECT * FROM products WHERE id = ?", (item['product_id'],)).fetchone()
        
        if not product:
            conn.rollback()
            conn.close()
            raise HTTPException(status_code=404, detail=f"Product {item['product_id']} not found")
        
        if product['stock'] < item['quantity']:
            conn.rollback()
            conn.close()
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product['name']}")
        
        # Insert order item
        cursor.execute(
            """INSERT INTO order_items (order_id, product_id, product_name, quantity, price) 
               VALUES (?, ?, ?, ?, ?)""",
            (order_id, item['product_id'], product['name'], item['quantity'], item['price'])
        )
        
        # Update stock
        cursor.execute(
            "UPDATE products SET stock = stock - ? WHERE id = ?",
            (item['quantity'], item['product_id'])
        )
    
    conn.commit()
    conn.close()
    
    return {
        "id": order_id,
        "order_number": order_number,
        "message": "Order created successfully"
    }

@app.get("/api/orders/customer/{customer_id}")
async def get_customer_orders(customer_id: int):
    """Get all orders for a customer"""
    conn = get_db()
    cursor = conn.cursor()
    
    orders = cursor.execute(
        """SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC""",
        (customer_id,)
    ).fetchall()
    
    result = []
    for order in orders:
        # Get order items
        items = cursor.execute(
            """SELECT * FROM order_items WHERE order_id = ?""",
            (order['id'],)
        ).fetchall()
        
        order_dict = dict(order)
        order_dict['items'] = [dict(item) for item in items]
        result.append(order_dict)
    
    conn.close()
    return result

@app.post("/api/orders")
async def create_order(order: Order, customer_id: int = Depends(get_current_customer)):
    if not customer_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Generate order number
    order_number = f"ORD-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Create order
    cursor.execute(
        "INSERT INTO orders (orderNumber, customerId, totalAmount, status, shippingAddress, paymentMethod) VALUES (?, ?, ?, ?, ?, ?)",
        (order_number, customer_id, order.totalAmount, order.status, order.shippingAddress, order.paymentMethod)
    )
    order_id = cursor.lastrowid
    
    # Add order items and update stock
    for item in order.items:
        # Get product
        product = cursor.execute("SELECT * FROM products WHERE id = ?", (item.productId,)).fetchone()
        
        if not product:
            conn.rollback()
            conn.close()
            raise HTTPException(status_code=404, detail=f"Product {item.productId} not found")
        
        if product['stock'] < item.quantity:
            conn.rollback()
            conn.close()
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product['name']}")
        
        # Insert order item
        cursor.execute(
            "INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)",
            (order_id, item.productId, item.quantity, product['price'])
        )
        
        # Update stock
        cursor.execute(
            "UPDATE products SET stock = stock - ? WHERE id = ?",
            (item.quantity, item.productId)
        )
    
    conn.commit()
    conn.close()
    
    return {
        "orderId": order_id,
        "orderNumber": order_number,
        "message": "Order created successfully"
    }

@app.get("/api/orders")
async def get_orders(customer_id: int = Depends(get_current_customer)):
    if not customer_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    conn = get_db()
    cursor = conn.cursor()
    
    orders = cursor.execute(
        """
        SELECT o.*, c.name as customerName
        FROM orders o
        JOIN customers c ON o.customerId = c.id
        WHERE o.customerId = ?
        ORDER BY o.createdAt DESC
        """,
        (customer_id,)
    ).fetchall()
    
    result = []
    for order in orders:
        # Get order items
        items = cursor.execute(
            """
            SELECT oi.*, p.name as productName
            FROM order_items oi
            JOIN products p ON oi.productId = p.id
            WHERE oi.orderId = ?
            """,
            (order['id'],)
        ).fetchall()
        
        result.append({
            **dict(order),
            "items": [dict(item) for item in items]
        })
    
    conn.close()
    return result

@app.get("/api/orders/{order_id}")
async def get_order(order_id: int, customer_id: int = Depends(get_current_customer)):
    if not customer_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    conn = get_db()
    cursor = conn.cursor()
    
    order = cursor.execute(
        """
        SELECT o.*, c.name as customerName
        FROM orders o
        JOIN customers c ON o.customerId = c.id
        WHERE o.id = ? AND o.customerId = ?
        """,
        (order_id, customer_id)
    ).fetchone()
    
    if not order:
        conn.close()
        raise HTTPException(status_code=404, detail="Order not found")
    
    items = cursor.execute(
        """
        SELECT oi.*, p.name as productName
        FROM order_items oi
        JOIN products p ON oi.productId = p.id
        WHERE oi.orderId = ?
        """,
        (order_id,)
    ).fetchall()
    
    conn.close()
    
    return {
        **dict(order),
        "items": [dict(item) for item in items]
    }

@app.on_event("startup")
async def startup_event():
    init_db()
    print("✅ E-commerce API initialized on http://localhost:8005")
    print("📦 Sample products loaded")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
