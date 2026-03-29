import { buildAppContext } from './app.js';
import { connectDatabase } from './config/database.js';
import { logger } from './config/logger.js';
import { env } from './config/env.js';
import { startSignalDetectionWorker } from './queues/signalDetectionQueue.js';

const startServer = async () => {
  try {
    await connectDatabase();
    const { app, services } = buildAppContext();

    if (env.signalDetectionQueueEnabled) {
      try {
        await startSignalDetectionWorker(services.signalDetectionService);
      } catch (error) {
        logger.warn('Signal detection worker could not be started', { error: error.message });
      }
    } else {
      logger.info('Signal detection queue disabled; skipping worker startup');
    }

    app.listen(env.port, () => logger.info(`Backend listening on port ${env.port}`));
  } catch (error) {
    logger.error('Failed to bootstrap server', { error: error.message });
    process.exit(1);
  }
};

startServer();
