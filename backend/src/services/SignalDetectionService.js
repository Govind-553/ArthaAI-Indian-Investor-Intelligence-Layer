import { env } from '../config/env.js';

export class SignalDetectionService {
  constructor(signalEngineClient, signalEngineRepository, alertService = null, signalDetectionQueue = null, signalRepository = null) {
    this.signalEngineClient = signalEngineClient;
    this.signalEngineRepository = signalEngineRepository;
    this.alertService = alertService;
    this.signalDetectionQueue = signalDetectionQueue;
    this.signalRepository = signalRepository;
  }

  async detectSignals(payload) {
    const result = await this.signalEngineClient.detectSignals(payload);
    await this.signalEngineRepository.saveSignalEvent({ request: payload, result });

    // Save detected signals to DB if repository is available
    if (this.signalRepository && result.signals?.length) {
      for (const signal of result.signals) {
        await this.signalRepository.saveSignal({
          symbol: payload.symbol,
          ...signal,
        });
      }
    }

    let triggeredAlerts = [];
    if (this.alertService && result.signals?.length) {
      triggeredAlerts = await this.alertService.triggerAlertsForSignals(payload.symbol, result.signals);
    }

    return {
      ...result,
      triggeredAlerts,
    };
  }

  async publishDetectionRequest(payload) {
    if (!this.signalDetectionQueue) {
      return {
        queued: false,
        queue: env.signalDetectionQueueName,
        reason: 'Signal detection queue is not configured',
      };
    }

    const job = await this.signalDetectionQueue.add('detect-signals', payload, {
      jobId: `${payload.symbol}-${Date.now()}`,
    });

    return {
      queued: true,
      queue: env.signalDetectionQueueName,
      jobId: job.id,
      symbol: payload.symbol,
    };
  }
}