// src/modules/legacy/programacionSiembra/programacionSiembra.module.ts

import { Module } from '@nestjs/common';
import { ProgramacionSiembraController } from './programacionSiembra.controller';
import { ProgramacionSiembraRepository } from './repositories/programacionSiembra.repository';
import { ProgramacionSiembraService } from './programacionSiembra.service';

@Module({
  controllers: [ProgramacionSiembraController],
  providers: [ProgramacionSiembraService, ProgramacionSiembraRepository],
})
export class LegacyProgramacionSiembraModule {}
