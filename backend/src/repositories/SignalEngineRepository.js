export class SignalEngineRepository {
  constructor() {
    this.signalEvents = [];
  }

  async saveSignalEvent(payload) {
    const event = {
      id: `signal-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
    };
    this.signalEvents.push(event);
    return event;
  }
}
