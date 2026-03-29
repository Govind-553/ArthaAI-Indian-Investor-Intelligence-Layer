import { AlertModel } from '../models/AlertModel.js';

export class AlertRepository {
  async createAlert(payload) {
    return AlertModel.create(payload);
  }

  async getAlertsByUserId(userId) {
    return AlertModel.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async getRecentSignals(limit = 20) {
    return AlertModel.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}
