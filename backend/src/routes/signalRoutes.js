import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../validators/index.js';
import { signalScoreSchema } from '../validators/signalValidator.js';

export const buildSignalRoutes = (signalController) => {
  const router = Router();
  router.get('/signals', asyncHandler(signalController.getSignals));
  router.post('/signals/score', validate(signalScoreSchema), asyncHandler(signalController.scoreSignal));
  return router;
};
