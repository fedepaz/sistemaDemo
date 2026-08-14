// src/modules/alertSolved/alertSolved.service.ts

import { Injectable, Logger } from '@nestjs/common';

import { AlertSolvedRepository } from './repositories/alertSolved.repository';
import { AlertSolvedDto, CreateAlertSolvedDto } from '@vivero/shared';

@Injectable()
export class AlertSolvedService {
  private readonly logger = new Logger(AlertSolvedService.name);
  constructor(private readonly repo: AlertSolvedRepository) {}

  async getSolvedAlerts(
    requesterId: string,
    returnAll = false,
  ): Promise<AlertSolvedDto[]> {
    const rows = await this.repo.findAllAlertsSolved(requesterId, returnAll);
    return rows.map((r) => ({
      id: r.id,
      partidaId: r.partidaId,
      anio: r.anio,
      indice: r.indice,
      userId: r.userId,
      userName: r.user.username,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async createSolvedAlert(data: CreateAlertSolvedDto, userId: string) {
    return this.repo.create({
      partidaId: data.partidaId,
      anio: data.anio,
      indice: data.indice,
      userId,
    });
  }
}
