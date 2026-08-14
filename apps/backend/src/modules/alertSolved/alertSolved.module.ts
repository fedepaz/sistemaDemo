// src/modules/alertSolved/alertSolved.module.ts

import { Module } from '@nestjs/common';
import { AlertSolvedController } from './alertSolved.controller';
import { AlertSolvedRepository } from './repositories/alertSolved.repository';
import { AlertSolvedService } from './alertSolved.service';

@Module({
  controllers: [AlertSolvedController],
  providers: [AlertSolvedService, AlertSolvedRepository],
  exports: [AlertSolvedService],
})
export class AlertSolvedModule {}
