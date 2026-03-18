// src/modules/health/health.controller.ts

import { Controller, Get, Logger } from '@nestjs/common';
import { Public } from '../../shared/decorators/public.decorator';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  constructor(private readonly healthService: HealthService) {}
  @Get()
  @Public()
  async healthCheck() {
    const { status, cached } = await this.healthService.getDatabaseStatus();
    return {
      status: status === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: status,
      cached,
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };
  }

  @Get('detailed')
  @Public()
  async detailedHealthCheck() {
    const { database } = await this.healthService.getDetailedDatabaseStatus();
    return {
      status: database.status === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database,
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

  @Get('auth')
  authCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      auth: 'authenticated',
    };
  }
}
