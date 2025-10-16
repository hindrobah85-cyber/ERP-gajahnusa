import { Router } from 'express';
import { 
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateStock,
  getLowStockItems,
  getInventoryMovements
} from '@/controllers/inventoryController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateInventoryItem, validateStockUpdate } from '../middleware/validationMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Inventory CRUD operations
router.get('/', getInventoryItems);
router.get('/low-stock', getLowStockItems);
router.get('/movements', getInventoryMovements);
router.get('/:id', getInventoryItem);
router.post('/', validateInventoryItem, createInventoryItem);
router.put('/:id', validateInventoryItem, updateInventoryItem);
router.delete('/:id', deleteInventoryItem);

// Stock management
router.post('/:id/stock', validateStockUpdate, updateStock);

export default router;