import { PortfolioModel } from '../models/PortfolioModel.js';

export class PortfolioRepository {
  async findByUserId(userId) {
    return PortfolioModel.findOne({ userId }).lean();
  }

  async createForUser(userId) {
    return PortfolioModel.create({ userId, holdings: [] });
  }

  async ensurePortfolio(userId) {
    const existing = await this.findByUserId(userId);
    if (existing) {
      return existing;
    }

    return this.createForUser(userId);
  }

  async addHolding(userId, payload) {
    return PortfolioModel.findOneAndUpdate(
      { userId },
      {
        $push: {
          holdings: {
            symbol: payload.symbol,
            quantity: payload.quantity,
            avgPrice: payload.avg_price,
          },
        },
      },
      { new: true },
    ).lean();
  }
}
