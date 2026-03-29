import { HTTP_STATUS } from '../utils/constants.js';

export class SignalController {
  constructor(signalService) {
    this.signalService = signalService;
  }

  getSignals = async (_req, res) => {
    const result = await this.signalService.getSignals();
    return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
  };

  scoreSignal = async (req, res) => {
    const result = await this.signalService.scoreSignal(req.body);
    return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
  };
}
