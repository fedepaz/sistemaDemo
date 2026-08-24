// src/modules/sustratos/sustratos.module.ts

import { Module } from '@nestjs/common';
import { SustratosController } from './sustratos.controller';
import { SustratosService } from './sustratos.service';
import { SustratosRepository } from './repositories/sustratos.repository';

@Module({
  controllers: [SustratosController],
  providers: [SustratosService, SustratosRepository],
  exports: [SustratosService],
})
export class SustratosModule {}
