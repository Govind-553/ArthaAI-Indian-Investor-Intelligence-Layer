import Joi from 'joi';
import { commonSchemas } from './index.js';

export const chatQuerySchema = Joi.object({
  question: Joi.string().min(5).max(500).required(),
  riskProfile: Joi.string().valid('conservative', 'moderate', 'aggressive').default('moderate'),
  portfolio: Joi.array().items(commonSchemas.portfolioHolding).default([]),
});
