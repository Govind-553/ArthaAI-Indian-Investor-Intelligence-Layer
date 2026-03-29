import { HTTP_STATUS } from '../utils/constants.js';

export class HealthController {
  getHealth(_req, res) {
    return res.status(HTTP_STATUS.OK).json({
      status: 'ok',
      service: 'arthaai-backend',
      timestamp: new Date().toISOString(),
    });
  }
}
