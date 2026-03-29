import { HTTP_STATUS } from '../utils/constants.js';
import { logger } from '../config/logger.js';

export const errorHandler = (error, _req, res, _next) => {
  logger.error('Unhandled application error', {
    message: error.message,
    stack: error.stack,
    details: error.details,
  });

  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = error.message || 'Internal server error';

  return res.status(statusCode).json({
    success: false,
    error: message, // Standardized to string
    ...(process.env.NODE_ENV === 'development' ? { details: error.details || null } : {}),
  });
};
