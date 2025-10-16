import { Router } from 'express';
import { 
  getLogisticsReport,
  getWarehouseReport,
  getDeliveryReport,
  getCostAnalysis,
  exportReport
} from '../controllers/reportsController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/logistics', getLogisticsReport);
router.get('/warehouse', getWarehouseReport);
router.get('/delivery', getDeliveryReport);
router.get('/cost-analysis', authorize(['admin', 'logistics_manager']), getCostAnalysis);
router.post('/export', exportReport);

export default router;