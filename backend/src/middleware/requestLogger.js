import { logger } from '../config/logger.js';

export const requestLogger = (req, _res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.originalUrl,
    query: req.query,
  });
  next();
};
