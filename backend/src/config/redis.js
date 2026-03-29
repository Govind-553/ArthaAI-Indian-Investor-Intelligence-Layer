import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

let redisClient;

export const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis(env.redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });
    redisClient.on('error', (error) => logger.error('Redis error', { error: error.message }));
  }

  return redisClient;
};
