import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../validators/index.js';
import { signalDetectionRequestSchema } from '../validators/signalEngineValidator.js';

export const buildSignalEngineRoutes = (signalEngineController) => {
  const router = Router();
  router.post('/signal-engine/detect', validate(signalDetectionRequestSchema), asyncHandler(signalEngineController.detect));
  router.post('/signal-engine/events', validate(signalDetectionRequestSchema), asyncHandler(signalEngineController.queue));
  return router;
};
