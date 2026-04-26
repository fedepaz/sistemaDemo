// src/modules/legacy/extendidos/extendidos.module.ts

import { Module } from '@nestjs/common';
import { ExtendidosController } from './extendidos.controller';
import { ExtendidosService } from './extendidos.service';
import { ExtendidosRepository } from './repositories/extendidos.repository';

@Module({
  controllers: [ExtendidosController],
  providers: [ExtendidosService, ExtendidosRepository],
})
export class LegacyExtendidosModule {}
