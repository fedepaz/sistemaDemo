// src/modules/alertComments/repositories/alertComments.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';

import { BaseRepository } from '../../../shared/baseModule/base.repository';
import { AlertComment } from '../../../generated/prisma/client';

@Injectable()
export class AlertCommentsRepository extends BaseRepository<AlertComment> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.alertComment);
  }

  findByPartida(
    alertType: string,
    partidaId: number,
    anio: number,
    indice: number,
  ) {
    return this.model.findMany({
      where: { alertType, partidaId, anio, indice },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { username: true } } },
    });
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
