// src/modules/legacy/config/config.module.ts

import { Module } from '@nestjs/common';
import { LegacyConfigController } from './config.controller';
import { LegacyConfigService } from './config.service';
import { ConfigRepository } from './repositories/config.repository';

@Module({
  controllers: [LegacyConfigController],
  providers: [LegacyConfigService, ConfigRepository],
})
export class LegacyConfigModule {}
