import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../validators/index.js';
import { addHoldingSchema } from '../validators/portfolioValidator.js';

export const buildPortfolioRoutes = (portfolioController) => {
  const router = Router();

  router.post('/portfolio/holdings', asyncHandler(authenticate), validate(addHoldingSchema), asyncHandler(portfolioController.addHolding));
  router.get('/portfolio', asyncHandler(authenticate), asyncHandler(portfolioController.getPortfolio));
  router.get('/portfolio/pnl', asyncHandler(authenticate), asyncHandler(portfolioController.getPortfolioPnL));

  return router;
};
