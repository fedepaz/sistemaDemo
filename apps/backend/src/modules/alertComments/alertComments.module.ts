// src/modules/alertComments/alertComments.module.ts

import { Module } from '@nestjs/common';
import { AlertCommentsController } from './alertComments.controller';
import { AlertCommentsService } from './alertComments.service';
import { AlertCommentsRepository } from './repositories/alertComments.repository';
import { LegacyPartidasModule } from '../legacy/partidas/partidas.module';

@Module({
  imports: [LegacyPartidasModule],
  controllers: [AlertCommentsController],
  providers: [AlertCommentsService, AlertCommentsRepository],
  exports: [AlertCommentsService, AlertCommentsRepository],
})
export class AlertCommentsModule {}
