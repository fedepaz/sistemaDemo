// src/modules/legacy/legacyBase/legacyBase.module.ts

import { Module } from '@nestjs/common';
import { LegacyBaseController } from './legacyBase.controller';
import { LegacyBaseService } from './legacyBase.service';
import { LegacyBaseRepository } from './repositories/legacyBase.repository';

@Module({
  controllers: [LegacyBaseController],
  providers: [LegacyBaseService, LegacyBaseRepository],
})
export class LegacyBaseModule {}
