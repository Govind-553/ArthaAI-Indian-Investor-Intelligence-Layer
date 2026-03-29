import { HTTP_STATUS } from '../utils/constants.js';

export class AlertController {
  constructor(alertService) {
    this.alertService = alertService;
  }

  getAlerts = async (req, res) => {
    const alerts = await this.alertService.getAlerts(req.user.id);
    return res.status(HTTP_STATUS.OK).json({ success: true, data: alerts });
  };

  subscribe = async (req, res) => {
    const subscription = await this.alertService.subscribe(req.user.id, req.body);
    return res.status(HTTP_STATUS.CREATED).json({ success: true, data: subscription });
  };
}
