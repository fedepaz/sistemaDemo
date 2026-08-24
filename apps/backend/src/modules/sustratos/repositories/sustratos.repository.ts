// src/modules/sustratos/repositories/sustratos.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { BaseRepository } from '../../../shared/baseModule/base.repository';
import { Sustratos } from '../../../generated/prisma/client';

@Injectable()
export class SustratosRepository extends BaseRepository<Sustratos> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.sustratos);
  }

  async update(
    id: string,
    data: {
      nombre: string;
    },
  ) {
    return this.model.update({
      where: { id, deletedAt: null, isActive: true },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }
}
