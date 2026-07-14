// src/modules/legacy/alerts/repositories/alerts.repository.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import {
  LegacySiembraRetrasada,
  LegacyFaltaGerminacion,
  LegacyFaltantePlantas,
  LegacyFaltaPreExpedicion,
} from '../interfaces/alerts.interface';

@Injectable()
export class AlertsRepository {
  private readonly logger = new Logger(AlertsRepository.name);

  constructor(
    @Inject(LegacyMysqlService)
    private readonly legacyDb: LegacyMysqlService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async findSiembraRetrasada(): Promise<LegacySiembraRetrasada[]> {
    this.logger.warn('findSiembraRetrasada not yet implemented');
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findFaltaGerminacion(): Promise<LegacyFaltaGerminacion[]> {
    this.logger.warn('findFaltaGerminacion not yet implemented');
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findFaltantePlantas(): Promise<LegacyFaltantePlantas[]> {
    this.logger.warn('findFaltantePlantas not yet implemented');
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findFaltaPreExpedicion(): Promise<LegacyFaltaPreExpedicion[]> {
    this.logger.warn('findFaltaPreExpedicion not yet implemented');
    return [];
  }
}
