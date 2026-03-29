export class AlertService {
  constructor(alertRepository, alertSubscriptionRepository, notificationService) {
    this.alertRepository = alertRepository;
    this.alertSubscriptionRepository = alertSubscriptionRepository;
    this.notificationService = notificationService;
  }

  async subscribe(userId, payload) {
    const subscription = await this.alertSubscriptionRepository.upsertSubscription(userId, payload);
    return {
      id: subscription._id.toString(),
      threshold: subscription.threshold,
      channels: subscription.channels,
    };
  }

  async getAlerts(userId) {
    const alerts = await this.alertRepository.getAlertsByUserId(userId);
    return alerts.map((alert) => ({
      id: alert._id.toString(),
      symbol: alert.symbol,
      signalType: alert.signalType,
      score: alert.score,
      reason: alert.reason,
      status: alert.status,
      createdAt: alert.createdAt,
    }));
  }

  async triggerAlertsForSignals(symbol, signals) {
    const subscriptions = await this.alertSubscriptionRepository.getAllSubscriptions();
    const triggeredAlerts = [];

    for (const subscription of subscriptions) {
      for (const signal of signals) {
        if (signal.score > subscription.threshold) {
          const alert = await this.alertRepository.createAlert({
            userId: subscription.userId,
            symbol,
            signalType: signal.signal_type,
            score: signal.score,
            reason: signal.reason,
            status: 'triggered',
          });

          const channels = subscription.channels?.length ? subscription.channels : ['in_app'];
          for (const channel of channels) {
            await this.notificationService.send({
              userId: subscription.userId.toString(),
              channel,
              symbol,
              score: signal.score,
            });
          }

          alert.status = 'sent';
          await alert.save();

          triggeredAlerts.push({
            id: alert._id.toString(),
            symbol: alert.symbol,
            signalType: alert.signalType,
            score: alert.score,
          });
        }
      }
    }

    return triggeredAlerts;
  }
}
