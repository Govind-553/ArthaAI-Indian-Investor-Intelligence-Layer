import { HTTP_STATUS } from '../utils/constants.js';

export class MarketController {
  constructor(marketService) {
    this.marketService = marketService;
  }

  getOverview = async (_req, res) => {
    const overview = await this.marketService.getOverview();
    return res.status(HTTP_STATUS.OK).json({ success: true, data: overview });
  };
}
