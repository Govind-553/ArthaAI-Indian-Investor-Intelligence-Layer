import Joi from 'joi';

export const signalScoreSchema = Joi.object({
  symbol: Joi.string().trim().uppercase().required(),
  eventType: Joi.string().valid('bulk_deal', 'insider_trade', 'earnings', 'filing').required(),
  sentiment: Joi.string().valid('positive', 'neutral', 'negative').required(),
  metadata: Joi.object({
    dealValueCrore: Joi.number().min(0),
    note: Joi.string().allow(''),
  }).default({}),
});
