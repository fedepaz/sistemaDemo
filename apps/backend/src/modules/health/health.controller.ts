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
    return this.healthService.getAllServicesStatus();
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
