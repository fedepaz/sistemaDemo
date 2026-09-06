import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { BaseRepository } from '../../../shared/baseModule/base.repository';
import { Prisma, SiembraPartidas } from '../../../generated/prisma/client';

export type SiembraPartidasWithRelations = SiembraPartidas & {
  mezcla: {
    sustrato1: { nombre: string } | null;
    porcentaje1: number | null;
    sustrato2: { nombre: string } | null;
    porcentaje2: number | null;
    sustrato3: { nombre: string } | null;
    porcentaje3: number | null;
    sustrato4: { nombre: string } | null;
    porcentaje4: number | null;
  };
  user: { username: string };
};

@Injectable()
export class SiembraPartidasRepository extends BaseRepository<SiembraPartidas> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.siembraPartidas);
  }

  async createSiembraPartida(data: Prisma.SiembraPartidasCreateInput) {
    return this.model.create({
      data: {
        ...data,
      },
    });
  }

  override async findAll(
    requesterId: string,
  ): Promise<SiembraPartidasWithRelations[]> {
    const devIds = await this.getDevAccounts();

    return this.prisma.siembraPartidas.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        ...(devIds.includes(requesterId) ? {} : { id: { notIn: devIds } }),
      },
      include: {
        mezcla: {
          include: {
            sustrato1: { select: { nombre: true } },
            sustrato2: { select: { nombre: true } },
            sustrato3: { select: { nombre: true } },
            sustrato4: { select: { nombre: true } },
          },
        },
        user: { select: { username: true } },
      },
    });
  }

  override async findById(
    id: string,
    _requesterId: string,
  ): Promise<SiembraPartidasWithRelations | null> {
    return this.prisma.siembraPartidas.findFirst({
      where: { id },
      include: {
        mezcla: {
          include: {
            sustrato1: { select: { nombre: true } },
            sustrato2: { select: { nombre: true } },
            sustrato3: { select: { nombre: true } },
            sustrato4: { select: { nombre: true } },
          },
        },
        user: { select: { username: true } },
      },
    });
  }
}
