import { Worker } from 'bullmq';
import { env } from '../config/env.js';
import { getQueueConnection } from '../config/queue.js';
import { logger } from '../config/logger.js';

let signalDetectionWorker;

export const startSignalDetectionWorker = async (signalDetectionService) => {
  if (signalDetectionWorker) {
    return signalDetectionWorker;
  }

  signalDetectionWorker = new Worker(
    env.signalDetectionQueueName,
    async (job) => {
      logger.info('Processing signal detection job', {
        jobId: job.id,
        queue: env.signalDetectionQueueName,
        symbol: job.data.symbol,
      });

      return signalDetectionService.detectSignals(job.data);
    },
    {
      connection: getQueueConnection(),
    },
  );

  signalDetectionWorker.on('completed', (job) => {
    logger.info('Signal detection job completed', {
      jobId: job.id,
      queue: env.signalDetectionQueueName,
    });
  });

  signalDetectionWorker.on('failed', (job, error) => {
    logger.error('Signal detection job failed', {
      jobId: job?.id,
      queue: env.signalDetectionQueueName,
      error: error.message,
    });
  });

  signalDetectionWorker.on('error', (error) => {
    logger.error('Signal detection worker error', { error: error.message });
  });

  await signalDetectionWorker.waitUntilReady();
  logger.info('Signal detection worker started', { queue: env.signalDetectionQueueName });

  return signalDetectionWorker;
};