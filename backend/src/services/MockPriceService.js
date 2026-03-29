import { MOCK_LIVE_PRICES } from '../utils/constants.js';

export class MockPriceService {
  async getLivePrice(symbol) {
    return {
      symbol,
      livePrice: MOCK_LIVE_PRICES[symbol] || 1000,
      source: 'mock-price-feed',
      asOf: new Date().toISOString(),
    };
  }
}
