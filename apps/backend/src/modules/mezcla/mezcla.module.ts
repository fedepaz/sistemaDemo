// src/modules/mezcla/mezcla.module.ts

import { Module } from '@nestjs/common';
import { MezclaController } from './mezcla.controller';
import { MezclaService } from './mezcla.service';
import { MezclaRepository } from './repositories/mezcla.repository';

@Module({
  controllers: [MezclaController],
  providers: [MezclaService, MezclaRepository],
  exports: [MezclaService],
})
export class MezclaModule {}
