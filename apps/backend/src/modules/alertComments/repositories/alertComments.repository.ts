// src/modules/alertComments/repositories/alertComments.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { BaseRepository } from '../../../shared/baseModule/base.repository';
import { AlertComment } from '../../../generated/prisma/client';

export type AlertCommentWithUser = {
  id: string;
  alertType: string;
  partidaId: number;
  anio: number;
  indice: number;
  content: string;
  userId: string;
  user: { username: string };
  createdAt: Date;
};

@Injectable()
export class AlertCommentsRepository extends BaseRepository<AlertComment> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.alertComment);
  }

  async findByPartida(
    alertType: string,
    partidaId: number,
    anio: number,
    indice: number,
  ): Promise<AlertCommentWithUser[]> {
    return this.prisma.alertComment.findMany({
      where: { alertType, partidaId, anio, indice },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true } } },
    });
  }

  async createWithUser(data: {
    alertType: string;
    partidaId: number;
    anio: number;
    indice: number;
    content: string;
    userId: string;
  }): Promise<AlertCommentWithUser> {
    const row = await this.prisma.alertComment.create({
      data,
      include: { user: { select: { username: true } } },
    });
    return row;
  }

  async getCommentCounts(
    alertType: string,
    keys: { partidaId: number; anio: number; indice: number }[],
  ) {
    if (keys.length === 0) return new Map<string, number>();

    const counts = await this.prisma.alertComment.groupBy({
      by: ['partidaId', 'anio', 'indice'],
      where: {
        alertType,
        OR: keys.map((k) => ({
          partidaId: k.partidaId,
          anio: k.anio,
          indice: k.indice,
        })),
      },
      _count: { id: true },
    });

    const map = new Map<string, number>();
    for (const c of counts) {
      map.set(`${c.partidaId}-${c.anio}-${c.indice}`, c._count.id);
    }
    return map;
  }
}
