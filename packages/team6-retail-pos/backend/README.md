# Team 6 - Retail POS System Backend API

🏬 **Backend API untuk Sistem POS Multi-Store Gajah Nusa**

## 📋 Deskripsi

Backend API untuk sistem Point of Sale (POS) multi-store dengan arsitektur terpusat. Mendukung manajemen 4 toko retail yang independent dengan integrasi warehouse pusat.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Native pg driver
- **Authentication**: JWT (planned)
- **Validation**: express-validator

## 📁 Struktur Database

### Tables

1. **stores** - Data toko (4 stores)
2. **products** - Master produk bahan bangunan (15 products)
3. **inventory** - Stock per toko (store-specific)
4. **central_warehouse** - Warehouse pusat HQ
5. **employees** - Data karyawan per toko
6. **transactions** - Transaksi penjualan
7. **transaction_items** - Detail item transaksi
8. **purchase_orders** - PO dari toko ke warehouse pusat
9. **purchase_order_items** - Detail item PO
10. **stock_movements** - Riwayat pergerakan stock

## 🚀 Setup & Installation

### 1. Install Dependencies

```bash
cd packages/team6-retail-pos/backend
npm install
```

### 2. Configure Environment

Edit file `.env`:

```env
PORT=8006
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gajahnusa_pos
DB_USER=postgres
DB_PASSWORD=your_password
```

### 3. Initialize Database

Pastikan PostgreSQL sudah running, kemudian:

```bash
npm run init-db
```

Script ini akan:
- ✅ Create semua tabel
- ✅ Insert sample data (4 stores, 15 products, 6 employees)
- ✅ Setup inventory dan central warehouse

### 4. Start Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server akan berjalan di: `http://localhost:8006`

## 📡 API Endpoints

### 🏢 Stores
- `GET /api/stores` - Get all stores
- `GET /api/stores/:id` - Get single store
- `POST /api/stores` - Create store
- `PUT /api/stores/:id` - Update store

### 📦 Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product

### 📊 Inventory (Per Store)
- `GET /api/inventory/store/:storeId` - Get inventory for store
- `POST /api/inventory/adjust` - Adjust stock (in/out/adjust)
- `GET /api/inventory/movements/store/:storeId` - Stock movements history

### 🏭 Central Warehouse
- `GET /api/central-warehouse` - Get all central warehouse inventory
- `GET /api/central-warehouse/:productId` - Get specific product
- `PUT /api/central-warehouse/:productId` - Update stock (HQ only)

### 💰 Transactions
- `GET /api/transactions/store/:storeId` - Get transactions for store
- `GET /api/transactions/:id` - Get single transaction with items
- `POST /api/transactions` - Create transaction (POS sale)

### 👥 Employees
- `GET /api/employees/store/:storeId` - Get employees for store
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee

### 📋 Purchase Orders
- `GET /api/purchase-orders/store/:storeId` - Get POs for store
- `GET /api/purchase-orders/:id` - Get single PO with items
- `POST /api/purchase-orders` - Create PO
- `PUT /api/purchase-orders/:id/status` - Update PO status

### 📈 Dashboard
- `GET /api/dashboard/store/:storeId` - Get dashboard stats
- `GET /api/dashboard/store/:storeId/monthly` - Monthly comparison

## 🔍 Query Parameters

### Inventory
```
/api/inventory/store/1?category=cement&search=semen&lowStock=true
```

### Transactions
```
/api/transactions/store/1?search=TRX-001&paymentMethod=cash&dateFrom=2025-01-01&dateTo=2025-01-31&limit=50
```

### Dashboard
```
/api/dashboard/store/1?period=today|week|month
```

## 📤 Request Examples

### Create Transaction (POS Sale)

```json
POST /api/transactions
{
  "storeId": 1,
  "customerName": "John Doe",
  "items": [
    {
      "id": 1,
      "name": "Semen Gajah 50kg",
      "code": "SMN-001",
      "quantity": 10,
      "price": 65000
    }
  ],
  "paymentMethod": "cash",
  "paymentReceived": 700000,
  "cashierId": 1
}
```

### Stock Adjustment

```json
POST /api/inventory/adjust
{
  "storeId": 1,
  "productId": 1,
  "type": "in",
  "quantity": 50,
  "reason": "Restocking from supplier",
  "employeeId": 3
}
```

### Create Purchase Order

```json
POST /api/purchase-orders
{
  "storeId": 1,
  "items": [
    {
      "productId": 1,
      "productName": "Semen Gajah 50kg",
      "quantity": 100,
      "price": 65000
    }
  ],
  "notes": "Urgent restock needed",
  "requestedBy": 1
}
```

## 🔐 Multi-Store Architecture

Setiap endpoint yang membutuhkan store context menggunakan `storeId`:
- Inventory dipisah per toko
- Transactions dipisah per toko
- Employees dipisah per toko
- Central warehouse dapat diakses semua toko (read-only)
- Purchase orders untuk request stock ke HQ

## 🎯 Business Logic

### Transaction Flow
1. Cashier membuat transaksi di frontend
2. Backend validate stock availability
3. Create transaction record
4. Insert transaction items
5. **Auto-reduce inventory stock**
6. Record stock movement
7. Return transaction receipt

### Purchase Order Flow
1. Store submit PO ke central warehouse
2. PO status: **pending**
3. HQ approve PO → status: **approved**
4. HQ ship items → status: **shipped**
5. Store receive items → status: **received**
6. **Auto-update store inventory**
7. **Auto-reduce central warehouse stock**

### Stock Adjustment Types
- `in` - Stock masuk (pembelian, retur)
- `out` - Stock keluar (kerusakan, transfer)
- `adjust` - Penyesuaian (stock opname)

## 🔄 Database Transactions

Semua operasi yang mengubah multiple tables menggunakan **PostgreSQL transactions**:
- ✅ Transaction creation → `BEGIN...COMMIT/ROLLBACK`
- ✅ Stock adjustment → `BEGIN...COMMIT/ROLLBACK`
- ✅ Purchase order creation → `BEGIN...COMMIT/ROLLBACK`
- ✅ PO status update → `BEGIN...COMMIT/ROLLBACK`

## 🧪 Testing

### Health Check
```bash
curl http://localhost:8006/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-16T...",
  "database": "connected"
}
```

### Get All Stores
```bash
curl http://localhost:8006/api/stores
```

## 📊 Sample Data

Setelah `npm run init-db`:

**Stores:**
- JKT-01 (Jakarta) 🏢
- BDG-01 (Bandung) 🏪
- SBY-01 (Surabaya) 🏬
- SMG-01 (Semarang) 🏭

**Products:** 15 items across 8 categories
**Employees:** 6 employees across 3 stores
**Inventory:** Fully stocked for Jakarta store

## 🚨 Error Handling

All errors return standardized JSON:

```json
{
  "error": "Error message here",
  "stack": "..." // only in development
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## 🔧 Development

### Database Reset
```bash
# Drop and recreate database
npm run init-db
```

### Add Migration
(Future: Add migration system)

## 📝 Notes

- Port: **8006** (default)
- CORS enabled for: `http://localhost:3006`
- Auto-generate transaction codes: `TRX-001`, `TRX-002`, ...
- Auto-generate PO numbers: `PO-0001`, `PO-0002`, ...
- All timestamps in ISO 8601 format

## 👨‍💻 Author

**Gajah Nusa - Team 6**
Building Material Distributor POS System
