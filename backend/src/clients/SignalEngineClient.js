import { AppError } from '../utils/AppError.js';

export class SignalEngineClient {
  constructor(baseUrl, fetchImpl = fetch) {
    this.baseUrl = baseUrl;
    this.fetchImpl = fetchImpl;
  }

  async detectSignals(payload) {
    const response = await this.fetchImpl(`${this.baseUrl}/signals/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new AppError('Signal engine request failed', response.status);
    }

    return response.json();
  }
}
