import Joi from 'joi';
import { AppError } from '../utils/AppError.js';

export const validate = (schema, property = 'body') => (req, _res, next) => {
  const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });

  if (error) {
    return next(new AppError('Validation failed', 400, error.details.map((detail) => detail.message)));
  }

  req[property] = value;
  return next();
};

export const commonSchemas = {
  portfolioHolding: Joi.object({
    symbol: Joi.string().trim().uppercase().required(),
    quantity: Joi.number().positive().required(),
    averagePrice: Joi.number().positive().required(),
  }),
};
