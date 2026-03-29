const sampleOverview = {
  indices: [
    { symbol: 'NIFTY50', value: 22410.3, change: 1.12 },
    { symbol: 'SENSEX', value: 73620.8, change: 0.96 },
    { symbol: 'BANKNIFTY', value: 48112.5, change: 1.54 },
  ],
  topMovers: [
    { symbol: 'RELIANCE', change: 2.8, direction: 'up' },
    { symbol: 'INFY', change: 2.2, direction: 'up' },
    { symbol: 'TATAMOTORS', change: -1.4, direction: 'down' },
  ],
  watchlistSignals: [
    { symbol: 'HDFCBANK', type: 'policy_sensitivity', confidence: 74 },
    { symbol: 'TCS', type: 'earnings_momentum', confidence: 81 },
  ],
};

export class MarketRepository {
  async getOverview() {
    return sampleOverview;
  }
}
