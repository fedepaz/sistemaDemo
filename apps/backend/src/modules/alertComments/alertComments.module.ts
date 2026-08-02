// src/modules/alertComments/alertComments.module.ts

import { Module } from '@nestjs/common';
import { AlertCommentsController } from './alertComments.controller';
import { AlertCommentsService } from './alertComments.service';
import { AlertCommentsRepository } from './repositories/alertComments.repository';

@Module({
  controllers: [AlertCommentsController],
  providers: [AlertCommentsService, AlertCommentsRepository],
  exports: [AlertCommentsService, AlertCommentsRepository],
})
export class AlertCommentsModule {}
