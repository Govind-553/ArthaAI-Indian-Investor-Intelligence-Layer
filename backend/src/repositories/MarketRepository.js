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
    { symbol: 'ADANIPORTS', change: 3.1, direction: 'up' },
    { symbol: 'BAJFINANCE', change: -0.8, direction: 'down' },
    { symbol: 'BHARTIARTL', change: 1.5, direction: 'up' },
    { symbol: 'AXISBANK', change: 2.1, direction: 'up' },
    { symbol: 'MARUTI', change: -0.5, direction: 'down' },
    { symbol: 'SUNPHARMA', change: 1.2, direction: 'up' },
    { symbol: 'HINDUNILVR', change: -1.1, direction: 'down' },
    { symbol: 'ITC', change: 0.4, direction: 'up' },
    { symbol: 'TITAN', change: 2.5, direction: 'up' },
    { symbol: 'ADANIENT', change: 4.2, direction: 'up' },
    { symbol: 'KOTAKBANK', change: -0.3, direction: 'down' },
    { symbol: 'LT', change: 1.8, direction: 'up' },
    { symbol: 'ULTRACEMCO', change: 2.2, direction: 'up' },
    { symbol: 'NTPC', change: 0.9, direction: 'up' },
    { symbol: 'POWERGRID', change: 1.1, direction: 'up' },
    { symbol: 'ONGC', change: -2.4, direction: 'down' },
    { symbol: 'COALINDIA', change: 3.5, direction: 'up' },
    { symbol: 'JSWSTEEL', change: -1.2, direction: 'down' },
    { symbol: 'TATASTEEL', change: 0.8, direction: 'up' },
    { symbol: 'WIPRO', change: 2.4, direction: 'up' },
    { symbol: 'HCLTECH', change: 1.7, direction: 'up' },
    { symbol: 'ASIANPAINT', change: -0.9, direction: 'down' },
    { symbol: 'NESTLEIND', change: 0.2, direction: 'up' },
    { symbol: 'GRASIM', change: 1.5, direction: 'up' },
    { symbol: 'INDUSINDBK', change: -2.1, direction: 'down' },
    { symbol: 'TECHM', change: 3.2, direction: 'up' },
    { symbol: 'HINDALCO', change: 1.1, direction: 'up' },
  ],
  watchlistSignals: [
    { symbol: 'HDFCBANK', type: 'policy_sensitivity', confidence: 74 },
    { symbol: 'TCS', type: 'earnings_momentum', confidence: 81 },
    { symbol: 'ICICIBANK', type: 'digital_growth', confidence: 68 },
    { symbol: 'SBIN', type: 'recovery_signal', confidence: 72 },
    { symbol: 'ADANIGREEN', type: 'capex_surge', confidence: 85 },
    { symbol: 'CIPLA', type: 'pharma_launch', confidence: 77 },
  ],
};

export class MarketRepository {
  async getOverview() {
    return sampleOverview;
  }
}
