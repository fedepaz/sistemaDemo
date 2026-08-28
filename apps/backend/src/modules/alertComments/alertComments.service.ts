// src/modules/alertComments/alertComments.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { AlertCommentsRepository } from './repositories/alertComments.repository';
import { PartidasRepository } from '../legacy/partidas/repositories/partidas.repository';
import { CreateAlertCommentDto, AlertCommentDto } from '@vivero/shared';

@Injectable()
export class AlertCommentsService {
  constructor(
    private readonly repo: AlertCommentsRepository,
    private readonly partidaRepo: PartidasRepository,
  ) {}

  async getComments(
    alertType: string,
    partidaId: number,
    anio: number,
    indice: number,
  ): Promise<AlertCommentDto[]> {
    const rows = await this.repo.findByPartida(
      alertType,
      partidaId,
      anio,
      indice,
    );
    return rows.map((r) => ({
      id: r.id,
      alertType: r.alertType,
      partidaId: r.partidaId,
      anio: r.anio,
      indice: r.indice,
      content: r.content,
      userId: r.userId,
      userName: r.user.username,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async getCommentCounts(
    alertType: string,
    keys: { partidaId: number; anio: number; indice: number }[],
  ): Promise<Map<string, number>> {
    return this.repo.getCommentCounts(alertType, keys);
  }

  async createComment(
    data: CreateAlertCommentDto,
    userId: string,
  ): Promise<AlertCommentDto> {
    const partidaExists = await this.partidaRepo.findOne(data.partidaId);
    if (!partidaExists) {
      throw new NotFoundException('Partida not found');
    }

    const row = await this.repo.createWithUser({
      alertType: data.alertType,
      partidaId: data.partidaId,
      anio: data.anio,
      indice: data.indice,
      content: data.content,
      userId,
    });
    return {
      id: row.id,
      alertType: row.alertType,
      partidaId: row.partidaId,
      anio: row.anio,
      indice: row.indice,
      content: row.content,
      userId: row.userId,
      userName: row.user.username,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
