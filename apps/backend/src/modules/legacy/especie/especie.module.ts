// src/modules/legacy/especie/especie.module.ts

import { Module } from '@nestjs/common';
import { LegacyEspecieController } from './especie.controller';
import { LegacyEspecieService } from './especie.service';
import { EspecieRepository } from './repositories/especie.repository';

@Module({
  controllers: [LegacyEspecieController],
  providers: [LegacyEspecieService, EspecieRepository],
})
export class LegacyEspecieModule {}
