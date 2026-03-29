export class PortfolioService {
  constructor(portfolioRepository, priceService) {
    this.portfolioRepository = portfolioRepository;
    this.priceService = priceService;
  }

  calculateHoldingPnL(holding, livePrice) {
    const investedValue = holding.quantity * holding.avgPrice;
    const currentValue = holding.quantity * livePrice;
    const pnl = currentValue - investedValue;
    const pnlPercentage = investedValue === 0 ? 0 : Number(((pnl / investedValue) * 100).toFixed(2));

    return {
      symbol: holding.symbol,
      quantity: holding.quantity,
      avgPrice: holding.avgPrice,
      livePrice,
      investedValue: Number(investedValue.toFixed(2)),
      currentValue: Number(currentValue.toFixed(2)),
      pnl: Number(pnl.toFixed(2)),
      pnlPercentage,
    };
  }

  async addHolding(userId, payload) {
    await this.portfolioRepository.ensurePortfolio(userId);
    const portfolio = await this.portfolioRepository.addHolding(userId, payload);
    const holding = portfolio.holdings[portfolio.holdings.length - 1];
    const price = await this.priceService.getLivePrice(holding.symbol);

    return {
      portfolioId: portfolio._id.toString(),
      holding: this.calculateHoldingPnL(holding, price.livePrice),
      priceSource: price.source,
      asOf: price.asOf,
    };
  }

  async getPortfolio(userId) {
    const portfolio = await this.portfolioRepository.ensurePortfolio(userId);
    const normalizedPortfolio = portfolio.toObject ? portfolio.toObject() : portfolio;
    const holdings = await Promise.all(
      normalizedPortfolio.holdings.map(async (holding) => {
        const price = await this.priceService.getLivePrice(holding.symbol);
        return this.calculateHoldingPnL(holding, price.livePrice);
      }),
    );

    return {
      portfolioId: normalizedPortfolio._id.toString(),
      userId: normalizedPortfolio.userId.toString(),
      holdings,
    };
  }

  async getPortfolioPnL(userId) {
    const portfolio = await this.getPortfolio(userId);
    const totals = portfolio.holdings.reduce(
      (accumulator, holding) => ({
        investedValue: accumulator.investedValue + holding.investedValue,
        currentValue: accumulator.currentValue + holding.currentValue,
        pnl: accumulator.pnl + holding.pnl,
      }),
      { investedValue: 0, currentValue: 0, pnl: 0 },
    );

    const pnlPercentage = totals.investedValue === 0 ? 0 : Number(((totals.pnl / totals.investedValue) * 100).toFixed(2));

    return {
      ...portfolio,
      summary: {
        investedValue: Number(totals.investedValue.toFixed(2)),
        currentValue: Number(totals.currentValue.toFixed(2)),
        pnl: Number(totals.pnl.toFixed(2)),
        pnlPercentage,
      },
    };
  }
}
