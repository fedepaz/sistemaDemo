// src/modules/legacy/depositos/depositos.module.ts

import { Module } from '@nestjs/common';
import { DepositosController } from './depositos.controller';
import { DepositosService } from './depositos.service';
import { DepositosRepository } from './repositories/depositos.repository';

@Module({
  controllers: [DepositosController],
  providers: [DepositosService, DepositosRepository],
})
export class LegacyDepositosModule {}
