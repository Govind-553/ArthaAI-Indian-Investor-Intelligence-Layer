import { Queue } from 'bullmq';
import { env } from './env.js';

let queueConnection;

const parseRedisConnection = (redisUrl) => {
  const parsedUrl = new URL(redisUrl);
  const dbPath = parsedUrl.pathname?.replace('/', '');

  return {
    host: parsedUrl.hostname,
    port: Number(parsedUrl.port || 6379),
    username: parsedUrl.username || undefined,
    password: parsedUrl.password || undefined,
    db: dbPath ? Number(dbPath) : undefined,
    maxRetriesPerRequest: null,
  };
};

export const getQueueConnection = () => {
  if (!queueConnection) {
    queueConnection = parseRedisConnection(env.redisUrl);
  }

  return queueConnection;
};

let signalDetectionQueue;

export const getSignalDetectionQueue = () => {
  if (!signalDetectionQueue) {
    signalDetectionQueue = new Queue(env.signalDetectionQueueName, {
      connection: getQueueConnection(),
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 100,
        removeOnFail: 100,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });
  }

  return signalDetectionQueue;
};