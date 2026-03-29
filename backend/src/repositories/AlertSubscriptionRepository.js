import { AlertSubscriptionModel } from '../models/AlertSubscriptionModel.js';

export class AlertSubscriptionRepository {
  async upsertSubscription(userId, payload) {
    return AlertSubscriptionModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          threshold: payload.threshold,
          channels: payload.channels,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();
  }

  async getAllSubscriptions() {
    return AlertSubscriptionModel.find({}).lean();
  }
}
