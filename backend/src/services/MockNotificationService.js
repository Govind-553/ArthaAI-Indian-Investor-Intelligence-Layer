export class MockNotificationService {
  async send(payload) {
    return {
      delivered: true,
      channel: payload.channel,
      recipient: payload.userId,
      message: `Mock alert sent for ${payload.symbol} at score ${payload.score}`,
      sentAt: new Date().toISOString(),
    };
  }
}
