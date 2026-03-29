import { Router } from 'express';

export const buildHealthRoutes = (healthController) => {
  const router = Router();
  router.get('/health', healthController.getHealth.bind(healthController));
  return router;
};
