// src/modules/health/health.controller.ts

import { Controller, Get, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { Public } from '../../shared/decorators/public.decorator';

interface HealthCache {
  status: 'connected' | 'disconnected';
  lastCheck: number;
  consecutiveFailures: number;
}

const healthCache: HealthCache = {
  status: 'connected',
  lastCheck: 0,
  consecutiveFailures: 0,
};

// Adaptive cache duration based on health status
const CACHE_DURATION_HEALTHY = 30_000; // 30 seconds when healthy
const CACHE_DURATION_DEGRADED = 10_000; // 10 seconds when degraded
const MAX_CONSECUTIVE_FAILURES = 3;

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  constructor(private prisma: PrismaService) {}
  @Get()
  @Public()
  async healthCheck() {
    const now = Date.now();
    const cacheDuration =
      healthCache.status === 'connected'
        ? CACHE_DURATION_HEALTHY
        : CACHE_DURATION_DEGRADED;

    if (now - healthCache.lastCheck < cacheDuration) {
      return this.buildResponse(healthCache.status, true);
    }
    try {
      const isHealthy = await this.prisma.checkHealth(5000);
      if (isHealthy) {
        healthCache.status = 'connected';
        healthCache.consecutiveFailures = 0;
        healthCache.lastCheck = now;
        this.logger.log('Database health check result:', 'connected');
        return this.buildResponse('connected', false);
      } else {
        throw new Error('Health check failed');
      }
    } catch (error) {
      healthCache.consecutiveFailures++;
      healthCache.lastCheck = now;
      if (healthCache.consecutiveFailures > MAX_CONSECUTIVE_FAILURES) {
        healthCache.status = 'disconnected';
      }
      this.logger.error(
        `❌ Database health check failed (${healthCache.consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES})`,
        error instanceof Error ? error.message : 'Unknown error',
      );
      return this.buildResponse(healthCache.status, false);
    }
  }

  private buildResponse(
    dbStatus: 'connected' | 'disconnected',
    cached: boolean,
  ) {
    return {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      cached,
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };
  }

  @Get('auth')
  authCheck() {
    // This will only execute if DevAuthGuard passes
    try {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        auth: 'authenticated',
        user: 'dev@example.com', // From DevAuthGuard context
        tenant: 'dev-tenant-1', // From DevAuthGuard context
        version: process.env.npm_package_version || 'development',
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Auth health check failed', error.stack);
        return {
          status: 'degraded',
          timestamp: new Date().toISOString(),
          auth: 'unauthenticated',
          error: error.message,
        };
      } else {
        this.logger.error('Auth health check failed', error);
        return {
          status: 'degraded',
          timestamp: new Date().toISOString(),
          auth: 'unauthenticated',
        };
      }
    }
  }

  @Get('detailed')
  @Public()
  async detailedHealthCheck() {
    const dbHealthy = await this.prisma.checkHealth(5000);
    return {
      status: dbHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: {
        status: dbHealthy ? 'connected' : 'disconnected',
        consecutiveFailures: healthCache.consecutiveFailures,
        lastCheck: new Date(healthCache.lastCheck).toISOString(),
      },
      process: {
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
        pid: process.pid,
        version: process.version,
      },
      environment: process.env.NODE_ENV,
    };
  }
}
