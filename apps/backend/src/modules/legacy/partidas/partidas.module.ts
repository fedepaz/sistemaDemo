// src/modules/legacy/partidas/partidas.module.ts

import { Module } from '@nestjs/common';
import { PartidasController } from './partidas.controller';
import { PartidasService } from './partidas.service';
import { PartidasRepository } from './repositories/partidas.repository';
import { EspecieRepository } from '../especie/repositories/especie.repository';
import { SiembraPartidasModule } from '../../siembraPartidas/siembraPartidas.module';
import { TaskShiftsModule } from '../../taskShifts/taskShifts.module';
import { LegacyStockModule } from '../stock/stock.module';

@Module({
  imports: [SiembraPartidasModule, TaskShiftsModule, LegacyStockModule],
  controllers: [PartidasController],
  providers: [PartidasService, PartidasRepository, EspecieRepository],
  exports: [PartidasRepository],
})
export class LegacyPartidasModule {}
