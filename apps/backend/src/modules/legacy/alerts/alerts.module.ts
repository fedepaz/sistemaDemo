// src/modules/legacy/alerts/alerts.module.ts

import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { AlertsRepository } from './repositories/alerts.repository';
import { AlertCommentsModule } from '../../alertComments/alertComments.module';
import { AlertSolvedModule } from '../../alertSolved/alertSolved.module';

@Module({
  imports: [AlertCommentsModule, AlertSolvedModule],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsRepository],
})
export class LegacyAlertsModule {}
