import { HTTP_STATUS } from '../utils/constants.js';

export class ChatController {
  constructor(chatService) {
    this.chatService = chatService;
  }

  query = async (req, res) => {
    const response = await this.chatService.answerQuery(req.body);
    return res.status(HTTP_STATUS.OK).json({ success: true, data: response });
  };
}
