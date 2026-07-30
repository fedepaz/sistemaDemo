// src/modules/legacy/siembra/siembra.module.ts

import { Module } from '@nestjs/common';
import { SiembraController } from './siembra.controller';
import { SiembraRepository } from './repositories/siembra.repository';
import { SiembraService } from './siembra.service';

@Module({
  controllers: [SiembraController],
  providers: [SiembraService, SiembraRepository],
})
export class LegacySiembraModule {}
