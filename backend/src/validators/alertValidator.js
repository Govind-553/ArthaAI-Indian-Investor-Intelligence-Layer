import Joi from 'joi';

export const alertSubscriptionSchema = Joi.object({
  threshold: Joi.number().min(0).max(100).required(),
  channels: Joi.array().items(Joi.string().valid('in_app', 'email', 'sms')).min(1).default(['in_app']),
});
