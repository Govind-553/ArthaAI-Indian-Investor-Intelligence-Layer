export class ChatService {
  constructor(chatRepository, aiServiceClient) {
    this.chatRepository = chatRepository;
    this.aiServiceClient = aiServiceClient;
  }

  buildPortfolioImpact(portfolio) {
    return portfolio.map((holding) => ({
      symbol: holding.symbol,
      impact: holding.quantity > 10 ? 'positive' : 'neutral',
      reason: holding.quantity > 10 ? 'Material allocation gets amplified by market-moving events' : 'Smaller allocation reduces direct portfolio sensitivity',
    }));
  }

  async answerQuery(payload) {
    const insightResponse = await this.aiServiceClient.generateInsight({
      question: payload.question,
      marketContext: {
        holdings: payload.portfolio.map((holding) => holding.symbol),
        portfolio: payload.portfolio,
        riskProfile: payload.riskProfile,
      },
    });

    const result = {
      answer: insightResponse.answer,
      confidence: insightResponse.confidence,
      citations: insightResponse.citations || [],
      recommendation: insightResponse.recommendation,
      riskAnalysis: insightResponse.risk_analysis,
      portfolioImpact: this.buildPortfolioImpact(payload.portfolio),
    };

    await this.chatRepository.createConversationRecord({ ...payload, response: result });
    return result;
  }
}