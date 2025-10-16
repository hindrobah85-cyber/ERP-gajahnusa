import { Router } from 'express';
import { 
  trackShipment,
  updateTracking,
  getTrackingHistory,
  getActiveShipments,
  generateTrackingReport
} from '@/controllers/trackingController';
import { authenticateToken } from '@/middleware/authMiddleware';

const router = Router();

// Public tracking (no auth required)
router.get('/public/:trackingNumber', trackShipment);

// Authenticated routes
router.use(authenticateToken);

router.get('/active', getActiveShipments);
router.get('/:shipmentId/history', getTrackingHistory);
router.post('/:shipmentId/update', updateTracking);
router.get('/reports/:period', generateTrackingReport);

export default router;