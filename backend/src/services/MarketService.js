export class MarketService {
  constructor(marketRepository) {
    this.marketRepository = marketRepository;
  }

  async getOverview() {
    return this.marketRepository.getOverview();
  }
}
