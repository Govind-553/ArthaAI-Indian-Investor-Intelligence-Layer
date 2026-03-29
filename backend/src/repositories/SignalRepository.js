export class SignalRepository {
  async saveSignalScore(payload) {
    return {
      id: `${payload.symbol}-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
    };
  }
}
