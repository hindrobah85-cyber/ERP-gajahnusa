import { Router } from 'express';
import { 
  createShipment,
  getShipments,
  getShipment,
  updateShipmentStatus,
  cancelShipment,
  getShipmentsByOrder,
  generateShippingLabel
} from '@/controllers/shippingController';
import { authenticateToken, authorize } from '@/middleware/authMiddleware';
import { validateShipment } from '@/middleware/validationMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Shipment operations
router.get('/', getShipments);
router.get('/order/:orderId', getShipmentsByOrder);
router.get('/:id', getShipment);
router.post('/', validateShipment, createShipment);
router.put('/:id/status', authorize(['admin', 'logistics_manager', 'warehouse_staff']), updateShipmentStatus);
router.delete('/:id', authorize(['admin', 'logistics_manager']), cancelShipment);
router.get('/:id/label', authorize(['logistics_manager', 'warehouse_staff']), generateShippingLabel);

export default router;