import { Router } from 'express';
import { 
  optimizeRoutes,
  optimizeInventory,
  getOptimizationReport,
  scheduleOptimization,
  optimizeWarehouseLayout
} from '../controllers/optimizationController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication and manager+ privileges
router.use(authenticateToken);
router.use(authorize(['admin', 'logistics_manager']));

router.post('/routes', optimizeRoutes);
router.post('/inventory', optimizeInventory);
router.post('/warehouse/:id/layout', optimizeWarehouseLayout);
router.get('/reports', getOptimizationReport);
router.post('/schedule', scheduleOptimization);

export default router;