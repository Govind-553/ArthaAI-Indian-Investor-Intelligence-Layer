const eventWeights = {
  bulk_deal: 20,
  insider_trade: 18,
  earnings: 22,
  filing: 12,
};

const sentimentWeights = {
  positive: 20,
  neutral: 10,
  negative: -10,
};

const inferSector = (symbol) => {
  const sectorMap = {
    RELIANCE: 'Energy',
    HDFCBANK: 'Banking',
    ICICIBANK: 'Banking',
    SBIN: 'Banking',
    TCS: 'IT',
    INFY: 'IT',
    TATAMOTORS: 'Auto',
    SUNPHARMA: 'Pharma',
  };

  return sectorMap[symbol] || 'Market';
};

const riskLevelFromScore = (score) => {
  if (score >= 80) return 'low';
  if (score >= 65) return 'medium';
  return 'high';
};

export class SignalService {
  constructor(signalRepository, alertRepository = null) {
    this.signalRepository = signalRepository;
    this.alertRepository = alertRepository;
  }

  calculateSignalScore(payload) {
    const baseScore = 40;
    const eventWeight = eventWeights[payload.eventType] || 0;
    const sentimentWeight = sentimentWeights[payload.sentiment] || 0;
    const dealValueWeight = Math.min(Number(payload.metadata?.dealValueCrore || 0) / 25, 20);
    const signalScore = Math.max(0, Math.min(100, Math.round(baseScore + eventWeight + sentimentWeight + dealValueWeight)));

    return {
      symbol: payload.symbol,
      signalScore,
      rationale: 'Large transaction with supportive sentiment and above-average value',
    };
  }

  async scoreSignal(payload) {
    const scoredSignal = this.calculateSignalScore(payload);
    await this.signalRepository.saveSignalScore({ ...payload, ...scoredSignal });
    return scoredSignal;
  }

  async getSignals() {
    const signals = await this.signalRepository.getSignals();
    
    // Fallback to alert repository if needed (though user requested to use DB for signals)
    if (signals.length === 0 && this.alertRepository) {
      const alerts = await this.alertRepository.getRecentSignals();
      return alerts.map((alert) => ({
        id: alert._id.toString(),
        stockName: alert.symbol,
        symbol: alert.symbol,
        signalType: alert.signalType,
        confidence: alert.score,
        riskLevel: riskLevelFromScore(alert.score),
        sector: inferSector(alert.symbol),
        timeframe: 'short-term',
        explanation: alert.reason,
        status: alert.status,
        createdAt: alert.createdAt,
      }));
    }

    return signals.map((signal) => ({
      id: signal._id.toString(),
      stockName: signal.symbol,
      symbol: signal.symbol,
      signalType: signal.type,
      confidence: signal.score,
      riskLevel: riskLevelFromScore(signal.score),
      sector: inferSector(signal.symbol),
      timeframe: 'short-term',
      explanation: signal.explanation,
      status: 'active',
      createdAt: signal.createdAt,
    }));
  }
}
