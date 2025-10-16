# Team 2 - Logistics Backend

Sistem backend untuk manajemen logistik, inventory, dan shipping dalam ERP system.

## 🚀 Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Knex.js
- **Cache**: Redis
- **Queue**: Bull (Redis-based)
- **Real-time**: Socket.IO
- **Validation**: Joi
- **Authentication**: JWT

## 📁 Project Structure

```
src/
├── config/          # Database, Redis, Queue configurations
├── controllers/     # Business logic handlers
├── middleware/      # Authentication, validation, error handling
├── routes/          # API route definitions
├── migrations/      # Database schema migrations
├── seeds/           # Database seed data
└── utils/           # Utility functions
```

## 🔧 Features

### Inventory Management
- ✅ CRUD operations untuk inventory items
- ✅ Real-time stock tracking
- ✅ Low stock alerts
- ✅ Inventory movements history
- ✅ Multi-warehouse support
- ✅ Barcode support
- ✅ Batch/expiry tracking

### Warehouse Operations
- ✅ Multi-warehouse management
- ✅ Warehouse optimization
- ✅ Location tracking
- ✅ Capacity management

### Shipping & Tracking
- ✅ Shipment creation dan management
- ✅ Real-time tracking updates
- ✅ Multiple carrier support
- ✅ Shipping label generation
- ✅ Delivery notifications

### Optimization Engine
- ✅ Route optimization
- ✅ Inventory distribution optimization
- ✅ Performance analytics
- ✅ Cost optimization suggestions

### Reporting & Analytics
- ✅ Inventory reports
- ✅ Warehouse performance reports
- ✅ Shipping analytics
- ✅ Export capabilities (PDF, Excel)

## 🛠️ Setup & Installation

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 13
- Redis >= 6.0

### Environment Variables
Copy `.env.example` to `.env` dan sesuaikan:

```env
NODE_ENV=development
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=erp_logistics
DB_USER=postgres
DB_PASSWORD=your_password
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret_key
```

### Installation
```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed

# Start development server
npm run dev
```

## 📊 API Endpoints

### Inventory Management
```
GET    /api/inventory          # Get all inventory items
GET    /api/inventory/:id      # Get specific item
POST   /api/inventory          # Create new item
PUT    /api/inventory/:id      # Update item
DELETE /api/inventory/:id      # Delete item
POST   /api/inventory/:id/stock # Update stock levels
GET    /api/inventory/low-stock # Get low stock items
GET    /api/inventory/movements # Get movements history
```

### Warehouse Operations
```
GET    /api/warehouse          # Get all warehouses
GET    /api/warehouse/:id      # Get specific warehouse
POST   /api/warehouse          # Create warehouse
PUT    /api/warehouse/:id      # Update warehouse
DELETE /api/warehouse/:id      # Delete warehouse
GET    /api/warehouse/:id/inventory # Get warehouse inventory
POST   /api/warehouse/:id/optimize # Optimize warehouse layout
```

### Shipping & Tracking
```
GET    /api/shipping           # Get all shipments
GET    /api/shipping/:id       # Get specific shipment
POST   /api/shipping           # Create shipment
PUT    /api/shipping/:id/status # Update shipment status
GET    /api/tracking/public/:trackingNumber # Public tracking
GET    /api/tracking/:shipmentId/history   # Tracking history
POST   /api/tracking/:shipmentId/update    # Update tracking
```

### Optimization
```
POST   /api/optimization/routes # Route optimization
POST   /api/optimization/inventory-distribution # Inventory optimization
GET    /api/optimization/suggestions # Get optimization suggestions
```

### Reports
```
GET    /api/reports/inventory   # Inventory reports
GET    /api/reports/warehouse   # Warehouse reports
GET    /api/reports/shipping    # Shipping reports
GET    /api/reports/performance # Performance reports
```

## 🔐 Authentication & Authorization

Semua API endpoints (kecuali public tracking) memerlukan authentication:

```http
Authorization: Bearer <jwt_token>
```

### User Roles:
- `admin` - Full access
- `logistics_manager` - Manage logistics operations
- `warehouse_staff` - Warehouse operations
- `viewer` - Read-only access

## 🚀 Development

### Run in Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Run Tests
```bash
npm test
npm run test:watch
```

### Database Operations
```bash
# Run migrations
npm run db:migrate

# Rollback migrations
knex migrate:rollback

# Create new migration
knex migrate:make migration_name

# Seed database
npm run db:seed
```

## 🔄 Real-time Updates

WebSocket events untuk real-time updates:

```javascript
// Client-side Socket.IO
socket.emit('join_warehouse', warehouseId);
socket.emit('join_shipment', shipmentId);

// Listen for updates
socket.on('inventory_updated', (data) => {
  // Handle inventory update
});

socket.on('shipment_status_changed', (data) => {
  // Handle shipment status change
});
```

## 📈 Performance & Monitoring

- **Caching**: Redis untuk caching frequent queries
- **Job Queue**: Bull untuk background processing
- **Rate Limiting**: Express rate limiter
- **Logging**: Winston untuk structured logging
- **Health Check**: `/health` endpoint untuk monitoring

## 🧪 Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage
npm run test:coverage
```

## 🚀 Deployment

### Using Docker
```bash
docker build -t team2-logistics .
docker run -p 3002:3002 --env-file .env team2-logistics
```

### Using PM2
```bash
npm run build
pm2 start dist/index.js --name "team2-logistics"
```

## 🔧 Configuration

### Database Configuration
Edit `src/config/database.ts` untuk database settings.

### Queue Configuration
Edit `src/config/queues.ts` untuk job queue settings.

### Redis Configuration
Edit `src/config/redis.ts` untuk Redis settings.

## 📝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.