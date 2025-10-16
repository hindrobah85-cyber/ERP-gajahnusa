import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { errorHandler, notFound } from '@/middleware/errorMiddleware';
import { logger } from '@/utils/logger';
import { connectDatabase } from '@/config/database';
import { setupRedis } from '@/config/redis';
import { setupQueues } from '@/config/queues';

// Routes
import inventoryRoutes from '@/routes/inventory';
import warehouseRoutes from './routes/warehouse';
import shippingRoutes from './routes/shipping';
import trackingRoutes from './routes/tracking';
import optimizationRoutes from './routes/optimization';
import reportsRoutes from './routes/reports';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-production-domain.com'] 
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3002;

// Rate limiting
const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW || '15') || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100') || 100,
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Team 2 - Logistics Backend',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/optimization', optimizationRoutes);
app.use('/api/reports', reportsRoutes);

// Socket.IO for real-time updates
io.on('connection', (socket: any) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join_warehouse', (warehouseId: string) => {
    socket.join(`warehouse_${warehouseId}`);
    logger.info(`Client ${socket.id} joined warehouse ${warehouseId}`);
  });
  
  socket.on('join_shipment', (shipmentId: string) => {
    socket.join(`shipment_${shipmentId}`);
    logger.info(`Client ${socket.id} joined shipment ${shipmentId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set('io', io);

// Error handling
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    // Initialize database connection
    await connectDatabase();
    logger.info('Database connected successfully');
    
    // Initialize Redis
    await setupRedis();
    logger.info('Redis connected successfully');
    
    // Initialize job queues
    await setupQueues();
    logger.info('Job queues initialized successfully');
    
    server.listen(PORT, () => {
      logger.info(`🚀 Team 2 - Logistics Backend running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

startServer();

export default app;