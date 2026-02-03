// src/health/health.controller.ts

import { Controller, Get, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { Public } from '../../shared/decorators/public.decorator';

let lastDBCheck = 0;
let dbStatus: 'connected' | 'disconnected' = 'connected';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  constructor(private prisma: PrismaService) {}
  @Get()
  @Public()
  async healthCheck() {
    const now = Date.now();
    if (now - lastDBCheck > 30_000) {
      try {
        await this.prisma.$executeRaw`SELECT 1`;
        dbStatus = 'connected';
      } catch (error) {
        this.logger.error('Database health check failed', error);
        dbStatus = 'disconnected';
      }
      lastDBCheck = now;
    }
    this.logger.log('Database health check result:', dbStatus);
    return {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: dbStatus,
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
}
