import { HTTP_STATUS } from '../utils/constants.js';
import { logger } from '../config/logger.js';

export const errorHandler = (error, _req, res, _next) => {
  logger.error('Unhandled application error', {
    message: error.message,
    stack: error.stack,
    details: error.details,
  });

  return res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      message: error.message || 'Internal server error',
      details: error.details || null,
    },
  });
};
