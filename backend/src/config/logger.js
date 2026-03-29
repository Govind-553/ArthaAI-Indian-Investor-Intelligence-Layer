import winston from 'winston';
import { env } from './env.js';

export const logger = winston.createLogger({
  level: env.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'arthaai-backend' },
  transports: [new winston.transports.Console()],
});
