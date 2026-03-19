// src/modules/health/health.module.ts

import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthRepository } from './repositories/health.repository';
import { HealthService } from './health.service';
import { LegacyMysqlModule } from 'src/infra/legacy-mysql/legacy-mysql.module';

@Module({
  imports: [LegacyMysqlModule],
  controllers: [HealthController],
  providers: [HealthService, HealthRepository],
})
export class HealthModule {}
