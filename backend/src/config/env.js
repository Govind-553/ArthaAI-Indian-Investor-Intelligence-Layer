import dotenv from 'dotenv';

dotenv.config();

const defaults = {
  PORT: '4000',
  MONGODB_URI: 'mongodb://localhost:27017/arthaai',
  REDIS_URL: 'redis://localhost:6379',
  ENABLE_SIGNAL_DETECTION_QUEUE: 'false',
  AI_SERVICE_URL: 'http://localhost:8001/api/v1',
  FRONTEND_URL: 'http://localhost:3000',
  LOG_LEVEL: 'info',
  JWT_SECRET: 'replace-with-a-strong-secret',
  JWT_EXPIRES_IN: '7d',
  SIGNAL_DETECTION_QUEUE_NAME: 'signal-detection',
  MARKET_DATA_BASE_URL: '',
  MARKET_DATA_QUOTES_PATH: '/quotes',
  MARKET_DATA_API_KEY_HEADER: 'Authorization',
  MARKET_DATA_API_KEY_PREFIX: 'Bearer',
  MARKET_DATA_SYMBOLS_PARAM: 'symbols',
  MARKET_DATA_MARKET_PARAM: 'market',
  MARKET_DATA_TIMEOUT_MS: '15000',
  MARKET_DATA_PROVIDER_NAME: 'nse-bse-live',
  MARKET_DATA_ENABLE_MOCK_FALLBACK: 'true',
};

export const env = {
  port: Number(process.env.PORT || defaults.PORT),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || defaults.MONGODB_URI,
  redisUrl: process.env.REDIS_URL || defaults.REDIS_URL,
  signalDetectionQueueEnabled:
    (process.env.ENABLE_SIGNAL_DETECTION_QUEUE || defaults.ENABLE_SIGNAL_DETECTION_QUEUE) === 'true',
  aiServiceUrl: process.env.AI_SERVICE_URL || defaults.AI_SERVICE_URL,
  frontendUrl: process.env.FRONTEND_URL || defaults.FRONTEND_URL,
  logLevel: process.env.LOG_LEVEL || defaults.LOG_LEVEL,
  jwtSecret: process.env.JWT_SECRET || defaults.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || defaults.JWT_EXPIRES_IN,
  signalDetectionQueueName: process.env.SIGNAL_DETECTION_QUEUE_NAME || defaults.SIGNAL_DETECTION_QUEUE_NAME,
  marketDataBaseUrl: process.env.MARKET_DATA_BASE_URL || defaults.MARKET_DATA_BASE_URL,
  marketDataQuotesPath: process.env.MARKET_DATA_QUOTES_PATH || defaults.MARKET_DATA_QUOTES_PATH,
  marketDataApiKey: process.env.MARKET_DATA_API_KEY || '',
  marketDataApiKeyHeader: process.env.MARKET_DATA_API_KEY_HEADER || defaults.MARKET_DATA_API_KEY_HEADER,
  marketDataApiKeyPrefix: process.env.MARKET_DATA_API_KEY_PREFIX || defaults.MARKET_DATA_API_KEY_PREFIX,
  marketDataSymbolsParam: process.env.MARKET_DATA_SYMBOLS_PARAM || defaults.MARKET_DATA_SYMBOLS_PARAM,
  marketDataMarketParam: process.env.MARKET_DATA_MARKET_PARAM || defaults.MARKET_DATA_MARKET_PARAM,
  marketDataTimeoutMs: Number(process.env.MARKET_DATA_TIMEOUT_MS || defaults.MARKET_DATA_TIMEOUT_MS),
  marketDataProviderName: process.env.MARKET_DATA_PROVIDER_NAME || defaults.MARKET_DATA_PROVIDER_NAME,
  marketDataEnableMockFallback: (process.env.MARKET_DATA_ENABLE_MOCK_FALLBACK || defaults.MARKET_DATA_ENABLE_MOCK_FALLBACK) === 'true',
};
