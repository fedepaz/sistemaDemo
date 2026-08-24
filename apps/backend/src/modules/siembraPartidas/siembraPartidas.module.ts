// src/modules/siembraPartidas/siembraPartidas.module.ts

import { Module } from '@nestjs/common';
import { SiembraPartidasController } from './siembraPartidas.controller';
import { SiembraPartidasService } from './siembraPartidas.service';
import { SiembraPartidasRepository } from './repositories/siembraPartidas.repository';

@Module({
  controllers: [SiembraPartidasController],
  providers: [SiembraPartidasService, SiembraPartidasRepository],
  exports: [SiembraPartidasService],
})
export class SiembraPartidasModule {}
