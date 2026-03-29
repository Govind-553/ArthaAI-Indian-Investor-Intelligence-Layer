import { env } from '../config/env.js';
import { MOCK_LIVE_PRICES } from '../utils/constants.js';

const pickFirst = (row, fields, fallback = null) => {
  for (const field of fields) {
    if (row?.[field] !== undefined && row[field] !== null) {
      return row[field];
    }
  }
  return fallback;
};

const toRowList = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Market data response must be an object or array');
  }

  for (const key of ['data', 'results', 'quotes', 'stocks', 'items']) {
    const value = payload[key];
    if (Array.isArray(value)) {
      return value;
    }

    if (value && typeof value === 'object') {
      return Object.entries(value).map(([symbol, item]) => ({ symbol, ...item }));
    }
  }

  return [payload];
};

export class NseBsePriceService {
  constructor(fetchImpl = fetch) {
    this.fetchImpl = fetchImpl;
  }

  buildHeaders() {
    const headers = { Accept: 'application/json' };
    if (env.marketDataApiKey) {
      headers[env.marketDataApiKeyHeader] = env.marketDataApiKeyPrefix
        ? `${env.marketDataApiKeyPrefix} ${env.marketDataApiKey}`.trim()
        : env.marketDataApiKey;
    }
    return headers;
  }

  getMockPrice(symbol) {
    return {
      symbol,
      livePrice: MOCK_LIVE_PRICES[symbol] || 1000,
      source: 'mock-price-feed',
      asOf: new Date().toISOString(),
    };
  }

  async getLivePrice(symbol, market = 'NSE') {
    if (!env.marketDataBaseUrl) {
      if (env.marketDataEnableMockFallback) {
        return this.getMockPrice(symbol);
      }
      throw new Error('MARKET_DATA_BASE_URL is not configured');
    }

    const params = new URLSearchParams({
      [env.marketDataSymbolsParam]: symbol.toUpperCase(),
      [env.marketDataMarketParam]: market.toUpperCase(),
    });
    const url = `${env.marketDataBaseUrl.replace(/\/$/, '')}/${env.marketDataQuotesPath.replace(/^\//, '')}?${params.toString()}`;

    try {
      const response = await this.fetchImpl(url, {
        method: 'GET',
        headers: this.buildHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Market data request failed with status ${response.status}`);
      }

      const payload = await response.json();
      const rows = toRowList(payload);
      const row = rows[0] || {};
      const livePrice = Number(pickFirst(row, ['lastPrice', 'ltp', 'price', 'close', 'last_trade_price']));

      if (!Number.isFinite(livePrice)) {
        throw new Error('Provider response did not include a valid live price');
      }

      return {
        symbol: String(pickFirst(row, ['symbol', 'ticker', 'tradingsymbol'], symbol)).toUpperCase(),
        livePrice,
        source: env.marketDataProviderName,
        asOf: pickFirst(row, ['fetchedAt', 'timestamp', 'updatedAt', 'lastUpdateTime'], new Date().toISOString()),
      };
    } catch (error) {
      if (env.marketDataEnableMockFallback) {
        return this.getMockPrice(symbol);
      }
      throw error;
    }
  }
}