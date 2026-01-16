// src/health/health.controller.ts

import { Controller, Get, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { Public } from '../../shared/decorators/public.decorator';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  constructor(private prisma: PrismaService) {}
  @Get()
  @Public()
  async healthCheck() {
    try {
      // ACTUAL DATABASE CONNECTIVITY TEST
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        version: process.env.npm_package_version || 'development',
        environment: process.env.NODE_ENV || 'development',
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Database health check failed', error.stack);
        return {
          status: 'degraded',
          timestamp: new Date().toISOString(),
          database: 'disconnected',
          error: error.message,
        };
      } else {
        this.logger.error('Database health check failed', error);
        return {
          status: 'degraded',
          timestamp: new Date().toISOString(),
          database: 'disconnected',
        };
      }
    }
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
