import { Router } from 'express';
import { 
  getWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseInventory,
  optimizeWarehouseLayout
} from '../controllers/warehouseController';
import { authenticateToken, authorize } from '@/middleware/authMiddleware';
import { validateWarehouse } from '@/middleware/validationMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Warehouse CRUD operations
router.get('/', getWarehouses);
router.get('/:id', getWarehouse);
router.post('/', authorize(['admin', 'logistics_manager']), validateWarehouse, createWarehouse);
router.put('/:id', authorize(['admin', 'logistics_manager']), validateWarehouse, updateWarehouse);
router.delete('/:id', authorize(['admin']), deleteWarehouse);

// Warehouse specific operations
router.get('/:id/inventory', getWarehouseInventory);
router.post('/:id/optimize', authorize(['admin', 'logistics_manager']), optimizeWarehouseLayout);

export default router;