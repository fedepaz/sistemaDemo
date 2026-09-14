// src/modules/siembraPartidas/siembraPartidas.module.ts

import { Module } from '@nestjs/common';
import { SiembraPartidasController } from './siembraPartidas.controller';
import { SiembraPartidasService } from './siembraPartidas.service';
import { SiembraPartidasRepository } from './repositories/siembraPartidas.repository';
import { PartidasRepository } from '../legacy/partidas/repositories/partidas.repository';
import { TaskShiftsModule } from '../taskShifts/taskShifts.module';
import { LegacyTratamientoModule } from '../legacy/tratamiento/tratamiento.module';
import { LegacySustratoModule } from '../legacy/sustrato/sustrato.module';

@Module({
  imports: [TaskShiftsModule, LegacyTratamientoModule, LegacySustratoModule],
  controllers: [SiembraPartidasController],
  providers: [
    SiembraPartidasService,
    SiembraPartidasRepository,
    PartidasRepository,
  ],
  exports: [SiembraPartidasService],
})
export class SiembraPartidasModule {}
