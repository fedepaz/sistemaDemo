// src/modules/alertSolved/repositories/alertSolved.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { BaseRepository } from '../../../shared/baseModule/base.repository';
import { AlertsSolved } from '../../../generated/prisma/client';

export type AlertSolvedWithUser = {
  id: string;
  partidaId: number;
  anio: number;
  indice: number;
  userId: string;
  user: { username: string };
  createdAt: Date;
};

@Injectable()
export class AlertSolvedRepository extends BaseRepository<AlertsSolved> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.alertsSolved);
  }

  async findAllAlertsSolved(
    requesterId: string,
    returnAll = false,
  ): Promise<AlertSolvedWithUser[]> {
    if (returnAll) {
      return this.prisma.alertsSolved.findMany({
        include: { user: { select: { username: true } } },
      });
    }

    const devIds = await this.getDevAccounts();

    if (devIds.includes(requesterId)) {
      return this.prisma.alertsSolved.findMany({
        include: { user: { select: { username: true } } },
      });
    }
    return this.prisma.alertsSolved.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        id: {
          notIn: devIds,
        },
      },
      include: { user: { select: { username: true } } },
    });
  }

  async create(data: {
    partidaId: number;
    anio: number;
    indice: number;
    userId: string;
  }): Promise<AlertsSolved> {
    return this.prisma.alertsSolved.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}
