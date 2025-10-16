import { Router } from 'express';
import { 
  trackShipment,
  updateTrackingInfo,
  getTrackingHistory,
  bulkTrackShipments,
  getDeliveryProof
} from '../controllers/trackingController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public tracking (no auth required)
router.get('/public/:trackingNumber', trackShipment);

// Authenticated routes
router.use(authenticateToken);

router.post('/bulk', bulkTrackShipments);
router.get('/:trackingNumber/history', getTrackingHistory);
router.post('/:trackingNumber/update', updateTrackingInfo);
router.get('/:trackingNumber/proof', getDeliveryProof);

export default router;