import { HTTP_STATUS } from '../utils/constants.js';

export class PortfolioController {
  constructor(portfolioService) {
    this.portfolioService = portfolioService;
  }

  addHolding = async (req, res) => {
    const result = await this.portfolioService.addHolding(req.user.id, req.body);
    return res.status(HTTP_STATUS.CREATED).json({ success: true, data: result });
  };

  getPortfolio = async (req, res) => {
    const result = await this.portfolioService.getPortfolio(req.user.id);
    return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
  };

  getPortfolioPnL = async (req, res) => {
    const result = await this.portfolioService.getPortfolioPnL(req.user.id);
    return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
  };
}
