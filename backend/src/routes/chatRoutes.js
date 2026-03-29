import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../validators/index.js';
import { chatQuerySchema } from '../validators/chatValidator.js';

export const buildChatRoutes = (chatController) => {
  const router = Router();
  router.post('/chat/query', validate(chatQuerySchema), asyncHandler(chatController.query));
  return router;
};
