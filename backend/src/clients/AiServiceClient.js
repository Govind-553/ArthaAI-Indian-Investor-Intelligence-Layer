import { AppError } from '../utils/AppError.js';
import { logger } from '../config/logger.js';

export class AiServiceClient {
  constructor(baseUrl, fetchImpl = fetch) {
    this.baseUrl = baseUrl;
    this.fetchImpl = fetchImpl;
    this.maxRetries = 3;
    this.timeoutMs = 10000; // 10 seconds timeout
  }

  async generateInsight(payload) {
    let lastError = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        logger.info(`AI Service Request [Attempt ${attempt}]`, {
          url: `${this.baseUrl}/insights/generate`,
          payload,
        });

        const response = await this.fetchImpl(`${this.baseUrl}/insights/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
          logger.error(`AI Service Error Response [Attempt ${attempt}]`, {
            status: response.status,
            data,
          });
          throw new AppError('AI service request failed', response.status);
        }

        logger.info(`AI Service Success Response [Attempt ${attempt}]`, {
          status: response.status,
        });

        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;
        
        const isTimeout = error.name === 'AbortError';
        logger.warn(`AI Service Request Failed [Attempt ${attempt}]`, {
          error: isTimeout ? 'Timeout' : error.message,
          stack: error.stack,
        });

        if (attempt === this.maxRetries) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
    
    logger.error('AI Service Final Failure', {
      error: lastError?.message,
      retries: this.maxRetries,
    });

    // Fallback message as requested
    return {
      insight: 'AI service temporarily unavailable',
      fallback: true,
    };
  }
}
