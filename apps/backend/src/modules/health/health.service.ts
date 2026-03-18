// src/modules/health/health.service.ts

import { Injectable, Logger } from '@nestjs/common';
import {
  CACHE_DURATION_DEGRADED,
  CACHE_DURATION_HEALTHY,
  HealthCache,
  MAX_CONSECUTIVE_FAILURES,
} from './interfaces/health.interface';
import { HealthRepository } from './repositories/health.repository';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private healthCache: HealthCache = {
    status: 'connected',
    lastCheck: 0,
    consecutiveFailures: 0,
  };
  constructor(private readonly healthRepository: HealthRepository) {}

  async getDatabaseStatus(): Promise<{
    status: 'connected' | 'disconnected';
    cached: boolean;
  }> {
    const now = Date.now();
    const cacheDuration =
      this.healthCache.status === 'connected'
        ? CACHE_DURATION_HEALTHY
        : CACHE_DURATION_DEGRADED;

    if (now - this.healthCache.lastCheck < cacheDuration) {
      return { status: this.healthCache.status, cached: true };
    }
    try {
      const isHealthy = await this.healthRepository.checkDatabaseHealth(5000);
      if (!isHealthy) throw new Error('Health check failed');
      this.healthCache = {
        status: 'connected',
        consecutiveFailures: 0,
        lastCheck: now,
      };
      this.logger.log('Database health check result:', 'connected');
      return { status: 'connected', cached: false };
    } catch (error) {
      this.healthCache.consecutiveFailures++;
      this.healthCache.lastCheck = now;

      if (this.healthCache.consecutiveFailures > MAX_CONSECUTIVE_FAILURES) {
        this.healthCache.status = 'disconnected';
      }
      this.logger.error(
        `❌ Database health check failed (${this.healthCache.consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES})`,
        error instanceof Error ? error.message : 'Unknown error',
      );
      return { status: this.healthCache.status, cached: false };
    }
  }

  async getDetailedDatabaseStatus() {
    const dbHealthy = await this.healthRepository.checkDatabaseHealth(5000);
    return {
      database: {
        status: dbHealthy ? 'connected' : 'disconnected',
        consecutiveFailures: this.healthCache.consecutiveFailures,
        lastCheck: new Date(this.healthCache.lastCheck).toISOString(),
      },
    };
  }
}
