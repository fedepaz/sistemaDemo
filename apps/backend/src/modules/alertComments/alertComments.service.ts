// src/modules/alertComments/alertComments.service.ts

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { AlertCommentsRepository } from './repositories/alertComments.repository';

@Injectable()
export class AlertCommentsService {
  constructor(private readonly repo: AlertCommentsRepository) {}

  async getComments(
    alertType: string,
    partidaId: number,
    anio: number,
    indice: number,
  ) {
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
      authorId: r.authorId,

      createdAt: r.createdAt.toISOString(),
    }));
  }

  async getCommentCounts(
    alertType: string,
    keys: { partidaId: number; anio: number; indice: number }[],
  ): Promise<Map<string, number>> {
    return this.repo.getCommentCounts(alertType, keys);
  }

  async createComment(dto, authorId: string) {
    const row = await this.repo.create({
      alertType: dto.alertType,
      partidaId: dto.partidaId,
      anio: dto.anio,
      indice: dto.indice,
      content: dto.content,
      authorId,
    });
    return {
      id: row.id,
      alertType: row.alertType,
      partidaId: row.partidaId,
      anio: row.anio,
      indice: row.indice,
      content: row.content,
      authorId: row.authorId,

      createdAt: row.createdAt.toISOString(),
    };
  }
}
