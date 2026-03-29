import { HTTP_STATUS } from '../utils/constants.js';

export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  register = async (req, res) => {
    const result = await this.authService.register(req.body);
    return res.status(HTTP_STATUS.CREATED).json({ success: true, data: result });
  };

  login = async (req, res) => {
    const result = await this.authService.login(req.body);
    return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
  };

  me = async (req, res) => {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  };
}
