import { AppError } from '../utils/AppError.js';

export class AiServiceClient {
  constructor(baseUrl, fetchImpl = fetch) {
    this.baseUrl = baseUrl;
    this.fetchImpl = fetchImpl;
  }

  async generateInsight(payload) {
    const response = await this.fetchImpl(`${this.baseUrl}/insights/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new AppError('AI service request failed', response.status);
    }

    return response.json();
  }
}
