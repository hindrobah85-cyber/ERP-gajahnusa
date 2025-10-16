import { Router } from 'express';
import { 
  optimizeRoutes,
  optimizeInventoryDistribution,
  generateOptimizationReport,
  getOptimizationSuggestions
} from '@/controllers/optimizationController';
import { authenticateToken, authorize } from '@/middleware/authMiddleware';

const router = Router();

// All routes require authentication and manager+ privileges
router.use(authenticateToken);
router.use(authorize(['admin', 'logistics_manager']));

router.post('/routes', optimizeRoutes);
router.post('/inventory-distribution', optimizeInventoryDistribution);
router.get('/suggestions', getOptimizationSuggestions);
router.get('/reports/:type', generateOptimizationReport);

export default router;