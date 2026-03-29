import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { getSignalDetectionQueue } from './config/queue.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { HealthController } from './controllers/HealthController.js';
import { MarketController } from './controllers/MarketController.js';
import { SignalController } from './controllers/SignalController.js';
import { ChatController } from './controllers/ChatController.js';
import { AuthController } from './controllers/AuthController.js';
import { PortfolioController } from './controllers/PortfolioController.js';
import { SignalEngineController } from './controllers/SignalEngineController.js';
import { AlertController } from './controllers/AlertController.js';
import { MarketRepository } from './repositories/MarketRepository.js';
import { SignalRepository } from './repositories/SignalRepository.js';
import { ChatRepository } from './repositories/ChatRepository.js';
import { UserRepository } from './repositories/UserRepository.js';
import { PortfolioRepository } from './repositories/PortfolioRepository.js';
import { SignalEngineRepository } from './repositories/SignalEngineRepository.js';
import { AlertRepository } from './repositories/AlertRepository.js';
import { AlertSubscriptionRepository } from './repositories/AlertSubscriptionRepository.js';
import { MarketService } from './services/MarketService.js';
import { SignalService } from './services/SignalService.js';
import { ChatService } from './services/ChatService.js';
import { AuthService } from './services/AuthService.js';
import { PortfolioService } from './services/PortfolioService.js';
import { NseBsePriceService } from './services/NseBsePriceService.js';
import { SignalDetectionService } from './services/SignalDetectionService.js';
import { AlertService } from './services/AlertService.js';
import { MockNotificationService } from './services/MockNotificationService.js';
import { AiServiceClient } from './clients/AiServiceClient.js';
import { SignalEngineClient } from './clients/SignalEngineClient.js';
import { buildHealthRoutes } from './routes/healthRoutes.js';
import { buildMarketRoutes } from './routes/marketRoutes.js';
import { buildSignalRoutes } from './routes/signalRoutes.js';
import { buildChatRoutes } from './routes/chatRoutes.js';
import { buildAuthRoutes } from './routes/authRoutes.js';
import { buildPortfolioRoutes } from './routes/portfolioRoutes.js';
import { buildSignalEngineRoutes } from './routes/signalEngineRoutes.js';
import { buildAlertRoutes } from './routes/alertRoutes.js';

const resolveSignalDetectionQueue = (providedQueue) => {
  if (providedQueue !== undefined) {
    return providedQueue;
  }

  if (!env.signalDetectionQueueEnabled) {
    return null;
  }

  return getSignalDetectionQueue();
};

export const buildAppContext = ({
  aiServiceClient = null,
  portfolioRepository = null,
  priceService = null,
  signalEngineClient = null,
  signalDetectionQueue = undefined,
  marketRepository = null,
  signalRepository = null,
  chatRepository = null,
  userRepository = null,
  signalEngineRepository = null,
  alertRepository = null,
  alertSubscriptionRepository = null,
  notificationService = null,
} = {}) => {
  const app = express();

  const resolvedMarketRepository = marketRepository || new MarketRepository();
  const resolvedSignalRepository = signalRepository || new SignalRepository();
  const resolvedChatRepository = chatRepository || new ChatRepository();
  const resolvedUserRepository = userRepository || new UserRepository();
  const resolvedPortfolioRepository = portfolioRepository || new PortfolioRepository();
  const resolvedSignalEngineRepository = signalEngineRepository || new SignalEngineRepository();
  const resolvedAlertRepository = alertRepository || new AlertRepository();
  const resolvedAlertSubscriptionRepository = alertSubscriptionRepository || new AlertSubscriptionRepository();

  const marketService = new MarketService(resolvedMarketRepository);
  const signalService = new SignalService(resolvedSignalRepository, resolvedAlertRepository);
  const chatService = new ChatService(resolvedChatRepository, aiServiceClient || new AiServiceClient(env.aiServiceUrl));
  const authService = new AuthService(resolvedUserRepository);
  const portfolioService = new PortfolioService(resolvedPortfolioRepository, priceService || new NseBsePriceService());
  const alertService = new AlertService(
    resolvedAlertRepository,
    resolvedAlertSubscriptionRepository,
    notificationService || new MockNotificationService(),
  );
  const signalDetectionService = new SignalDetectionService(
    signalEngineClient || new SignalEngineClient(env.aiServiceUrl),
    resolvedSignalEngineRepository,
    alertService,
    resolveSignalDetectionQueue(signalDetectionQueue),
    resolvedSignalRepository,
  );

  const healthController = new HealthController();
  const marketController = new MarketController(marketService);
  const signalController = new SignalController(signalService);
  const chatController = new ChatController(chatService);
  const authController = new AuthController(authService);
  const portfolioController = new PortfolioController(portfolioService);
  const signalEngineController = new SignalEngineController(signalDetectionService);
  const alertController = new AlertController(alertService);

  // More robust CORS for development
  const allowedOrigins = [env.frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'];
  app.use(cors({ 
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true 
  }));
  app.use(express.json());
  app.use(requestLogger);
  app.locals.userRepository = resolvedUserRepository;

  app.use('/api/v1', buildHealthRoutes(healthController));
  app.use('/api/v1', buildMarketRoutes(marketController));
  app.use('/api/v1', buildSignalRoutes(signalController));
  app.use('/api/v1', buildChatRoutes(chatController));
  app.use('/api/v1', buildAuthRoutes(authController));
  app.use('/api/v1', buildPortfolioRoutes(portfolioController));
  app.use('/api/v1', buildSignalEngineRoutes(signalEngineController));
  app.use('/api/v1', buildAlertRoutes(alertController));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return {
    app,
    services: {
      signalDetectionService,
    },
  };
};

export const createApp = (dependencies = {}) => buildAppContext(dependencies).app;
