import Joi from 'joi';

export const addHoldingSchema = Joi.object({
  symbol: Joi.string().trim().uppercase().required(),
  quantity: Joi.number().positive().required(),
  avg_price: Joi.number().positive().required(),
});
