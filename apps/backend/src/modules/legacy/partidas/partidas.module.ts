// src/modules/legacy/partidas/partidas.module.ts

import { Module } from '@nestjs/common';
import { PartidasController } from './partidas.controller';
import { PartidasService } from './partidas.service';
import { PartidasRepository } from './repositories/partidas.repository';

@Module({
  controllers: [PartidasController],
  providers: [PartidasService, PartidasRepository],
})
export class LegacyPartidasModule {}
