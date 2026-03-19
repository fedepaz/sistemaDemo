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
  private prismaCache: HealthCache = {
    status: 'connected',
    lastCheck: 0,
    consecutiveFailures: 0,
  };
  private legacyCache: HealthCache = {
    status: 'connected',
    lastCheck: 0,
    consecutiveFailures: 0,
  };
  constructor(private readonly healthRepository: HealthRepository) {}

  private async checkService(
    cache: HealthCache,
    checker: () => Promise<boolean>,
    label: string,
  ): Promise<{
    status: 'connected' | 'disconnected';
    cached: boolean;
  }> {
    const now = Date.now();
    const cacheDuration =
      cache.status === 'connected'
        ? CACHE_DURATION_HEALTHY
        : CACHE_DURATION_DEGRADED;

    if (now - cache.lastCheck < cacheDuration) {
      return { status: cache.status, cached: true };
    }
    try {
      const isHealthy = await checker();
      if (!isHealthy) throw new Error(`${label} check failed`);

      cache.status = 'connected';
      cache.consecutiveFailures = 0;
      cache.lastCheck = now;
      this.logger.log(`${label} health check result:`, 'connected');
      return { status: 'connected', cached: false };
    } catch (error) {
      cache.consecutiveFailures++;
      cache.lastCheck = now;

      if (cache.consecutiveFailures > MAX_CONSECUTIVE_FAILURES) {
        cache.status = 'disconnected';
      }
      this.logger.error(
        `❌ ${label} health check failed (${cache.consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES})`,
        error instanceof Error ? error.message : 'Unknown error',
      );
      return { status: cache.status, cached: false };
    }
  }

  async getDatabaseStatus() {
    return this.checkService(
      this.prismaCache,
      () => this.healthRepository.checkDatabaseHealth(5000),
      'Database',
    );
  }

  async getLegacyDatabaseStatus() {
    return this.checkService(
      this.legacyCache,
      () => this.healthRepository.checkLegacyDatabaseHealth(5000),
      'Legacy DB',
    );
  }

  async getAllServicesStatus() {
    const [prisma, legacy] = await Promise.all([
      this.getDatabaseStatus(),
      this.getLegacyDatabaseStatus(),
    ]);

    const allHealthy =
      prisma.status === 'connected' && legacy.status === 'connected';

    return {
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      services: {
        prisma,
        legacy,
      },
    };
  }
}
