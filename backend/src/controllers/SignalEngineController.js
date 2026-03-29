import { HTTP_STATUS } from '../utils/constants.js';

export class SignalEngineController {
  constructor(signalDetectionService) {
    this.signalDetectionService = signalDetectionService;
  }

  detect = async (req, res) => {
    const result = await this.signalDetectionService.detectSignals(req.body);
    return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
  };

  queue = async (req, res) => {
    const result = await this.signalDetectionService.publishDetectionRequest(req.body);
    return res.status(HTTP_STATUS.ACCEPTED).json({ success: true, data: result });
  };
}
