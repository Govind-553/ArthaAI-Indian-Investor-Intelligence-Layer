import Joi from 'joi';

export const signalDetectionRequestSchema = Joi.object({
  company: Joi.string().trim().required(),
  symbol: Joi.string().trim().uppercase().required(),
  price_data: Joi.object({
    current_price: Joi.number().positive().required(),
    previous_close: Joi.number().positive().required(),
    earnings_expected: Joi.number().optional(),
    earnings_actual: Joi.number().optional(),
  }).required(),
  volume_data: Joi.object({
    current_volume: Joi.number().min(0).required(),
    average_volume: Joi.number().positive().required(),
  }).required(),
  insider_trades: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('buy', 'sell').required(),
      quantity: Joi.number().positive().required(),
      insider_role: Joi.string().required(),
    })
  ).default([]),
  corporate_filings: Joi.array().items(
    Joi.object({
      event_type: Joi.string().required(),
      sentiment: Joi.string().valid('positive', 'neutral', 'negative').required(),
      confidence: Joi.number().min(0).max(1).required(),
    })
  ).default([]),
});
