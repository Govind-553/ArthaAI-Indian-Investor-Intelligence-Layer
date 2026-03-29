import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';

export const buildMarketRoutes = (marketController) => {
  const router = Router();
  router.get('/market/overview', asyncHandler(marketController.getOverview));
  return router;
};
