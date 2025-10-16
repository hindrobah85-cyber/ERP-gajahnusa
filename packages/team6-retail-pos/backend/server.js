import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './database.js';

// Import routes
import storesRouter from './routes/stores.js';
import productsRouter from './routes/products.js';
import inventoryRouter from './routes/inventory.js';
import transactionsRouter from './routes/transactions.js';
import employeesRouter from './routes/employees.js';
import purchaseOrdersRouter from './routes/purchaseOrders.js';
import centralWarehouseRouter from './routes/centralWarehouse.js';
import dashboardRouter from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8006;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3006',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'healthy',
      timestamp: result.rows[0].now,
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/stores', storesRouter);
app.use('/api/products', productsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/purchase-orders', purchaseOrdersRouter);
app.use('/api/central-warehouse', centralWarehouseRouter);
app.use('/api/dashboard', dashboardRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🏬 Gajah Nusa Retail POS API - Team 6',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      stores: '/api/stores',
      products: '/api/products',
      inventory: '/api/inventory',
      transactions: '/api/transactions',
      employees: '/api/employees',
      purchaseOrders: '/api/purchase-orders',
      centralWarehouse: '/api/central-warehouse',
      dashboard: '/api/dashboard'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ============================================');
  console.log('🏬 Gajah Nusa Retail POS API - Team 6');
  console.log('============================================');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🌐 CORS enabled for ${process.env.CORS_ORIGIN}`);
  console.log(`💾 Database: ${process.env.DB_NAME}`);
  console.log('============================================');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});
