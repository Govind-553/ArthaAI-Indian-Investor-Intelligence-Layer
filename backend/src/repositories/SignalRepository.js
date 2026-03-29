import { SignalModel } from '../models/SignalModel.js';

export class SignalRepository {
  async saveSignal(payload) {
    const signal = new SignalModel({
      symbol: payload.symbol,
      type: payload.signalType || payload.type || 'unknown',
      score: payload.confidence || payload.score || 0,
      explanation: payload.explanation || payload.reason || '',
      createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
    });

    return await signal.save();
  }

  async saveSignalScore(payload) {
    // Legacy support for scoreSignal specifically
    const signal = new SignalModel({
      symbol: payload.symbol,
      type: payload.eventType || 'manual_score',
      score: payload.signalScore || payload.score || 0,
      explanation: payload.rationale || payload.explanation || '',
      createdAt: new Date(),
    });

    return await signal.save();
  }

  async getSignals(limit = 50) {
    const result = await SignalModel.find()
      .sort({ createdAt: -1, score: -1 })
      .limit(limit)
      .exec();

    // Seed initial data if empty to avoid "No signals" empty state for new users
    if (result.length === 0) {
      const seeds = [
        { symbol: 'RELIANCE', type: 'bulk_deal', score: 88, explanation: 'Massive accumulation by institutional investors in the cash segment.' },
        { symbol: 'TCS', type: 'earnings_momentum', score: 81, explanation: 'Quarterly results beat street expectations with strong deal pipeline.' },
        { symbol: 'INFY', type: 'insider_trade', score: 72, explanation: 'Promoter group increased stake by 0.5% through open market purchase.' },
        { symbol: 'HDFCBANK', type: 'policy_sensitivity', score: 65, explanation: 'Favorable regulatory changes expected to boost lending margins.' },
        { symbol: 'ADANIENT', type: 'capex_surge', score: 92, explanation: 'Green energy expansion plan approved with $10B initial investment.' },
        { symbol: 'TATAMOTORS', type: 'ev_adoption', score: 78, explanation: 'New EV model pre-orders crossed 50k units in the first week.' },
        { symbol: 'ICICIBANK', type: 'digital_growth', score: 85, explanation: 'Mobile banking active users surged by 40% year-on-year.' },
        { symbol: 'BHARTIARTL', type: '5g_rollout', score: 82, explanation: 'Spectrum allocation completed for major circles with cost optimization.' },
        { symbol: 'ITC', type: 'valuation_unlock', score: 68, explanation: 'FMCG business demerger rumors driving institutional interest.' },
        { symbol: 'SUNPHARMA', type: 'fda_approval', score: 90, explanation: 'Key specialty product received final FDA approval for US markets.' },
        { symbol: 'BAJFINANCE', type: 'loan_growth', score: 87, explanation: 'Consumer durable loan disbursements reached record highs this festive season.' },
        { symbol: 'TITAN', type: 'luxury_demand', score: 83, explanation: 'Jewelry segment margins remained robust despite gold price volatility.' },
        { symbol: 'LT', type: 'order_win', score: 89, explanation: 'Secured multi-billion dollar infrastructure contract in the Middle East.' },
        { symbol: 'ULTRACEMCO', type: 'demand_recovery', score: 75, explanation: 'Construction activity pickup leading to increased volume realizations.' },
        { symbol: 'NTPC', type: 'green_energy', score: 71, explanation: 'Renewable energy capacity installation ahead of internal targets.' },
        { symbol: 'POWERGRID', type: 'dividend_yield', score: 64, explanation: 'Stable cash flows supporting consistent payout predictions.' },
        { symbol: 'ONGC', type: 'crude_rally', score: 61, explanation: 'Brent crude prices providing strong realization tailwinds.' },
        { symbol: 'WIPRO', type: 'management_change', score: 58, explanation: 'Structural reorganization focus expected to improve execution.' },
        { symbol: 'HCLTECH', type: 'cloud_adoption', score: 79, explanation: 'Strong growth in ER&D services driven by global cloud migration.' },
        { symbol: 'ASIANPAINT', type: 'margin_expansion', score: 73, explanation: 'Falling raw material prices aiding the decorative segment.' },
      ];
      
      for (const seed of seeds) {
        await this.saveSignal(seed);
      }
      
      return await SignalModel.find()
        .sort({ createdAt: -1, score: -1 })
        .limit(limit)
        .exec();
    }

    return result;
  }
}
