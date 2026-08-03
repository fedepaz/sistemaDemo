// src/modules/legacy/partidas/partidas.module.ts

import { Module } from '@nestjs/common';
import { PartidasController } from './partidas.controller';
import { PartidasService } from './partidas.service';
import { PartidasRepository } from './repositories/partidas.repository';
import { EspecieRepository } from '../especie/repositories/especie.repository';

@Module({
  controllers: [PartidasController],
  providers: [PartidasService, PartidasRepository, EspecieRepository],
  exports: [PartidasRepository],
})
export class LegacyPartidasModule {}
