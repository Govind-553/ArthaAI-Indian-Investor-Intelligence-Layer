import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../validators/index.js';
import { alertSubscriptionSchema } from '../validators/alertValidator.js';

export const buildAlertRoutes = (alertController) => {
  const router = Router();

  router.get('/alerts', asyncHandler(authenticate), asyncHandler(alertController.getAlerts));
  router.post('/alerts/subscribe', asyncHandler(authenticate), validate(alertSubscriptionSchema), asyncHandler(alertController.subscribe));

  return router;
};
