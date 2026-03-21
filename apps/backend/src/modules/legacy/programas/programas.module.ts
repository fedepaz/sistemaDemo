// src/modules/legacy/programas/programas.module.ts

import { Module } from '@nestjs/common';
import { ProgramasRepository } from './repositories/programas.repository';
import { LegacyProgramasService } from './programas.service';
import { LegacyProgramasController } from './programas.controller';

@Module({
  controllers: [LegacyProgramasController],
  providers: [ProgramasRepository, LegacyProgramasService],
})
export class LegacyProgramasModule {}
