import { Router } from 'express';
import { 
  getInventoryReport,
  getWarehouseReport,
  getShippingReport,
  getPerformanceReport,
  exportReport
} from '@/controllers/reportsController';
import { authenticateToken, authorize } from '@/middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/inventory', getInventoryReport);
router.get('/warehouse/:warehouseId?', getWarehouseReport);
router.get('/shipping', getShippingReport);
router.get('/performance', authorize(['admin', 'logistics_manager']), getPerformanceReport);
router.get('/:type/export', exportReport);

export default router;