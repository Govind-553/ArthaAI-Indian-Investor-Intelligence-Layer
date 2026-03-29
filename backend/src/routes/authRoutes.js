import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../validators/index.js';
import { loginSchema, registerSchema } from '../validators/authValidator.js';
import { authenticate } from '../middleware/authMiddleware.js';

export const buildAuthRoutes = (authController) => {
  const router = Router();

  router.post('/auth/register', validate(registerSchema), asyncHandler(authController.register));
  router.post('/auth/login', validate(loginSchema), asyncHandler(authController.login));
  router.get('/auth/me', asyncHandler(authenticate), asyncHandler(authController.me));

  return router;
};
