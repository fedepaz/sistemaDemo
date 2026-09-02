// src/modules/legacy/tratamiento/tratamiento.module.ts

import { Module } from '@nestjs/common';
import { LegacyTratamientoController } from './tratamiento.controller';
import { LegacyTratamientoService } from './tratamiento.service';
import { TratamientoRepository } from './repositories/tratamiento.repository';

@Module({
  controllers: [LegacyTratamientoController],
  providers: [LegacyTratamientoService, TratamientoRepository],
})
export class LegacyTratamientoModule {}
