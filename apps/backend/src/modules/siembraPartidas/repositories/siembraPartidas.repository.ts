import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { BaseRepository } from '../../../shared/baseModule/base.repository';
import { Prisma, SiembraPartidas } from '../../../generated/prisma/client';

export type SiembraPartidasWithRelations = SiembraPartidas & {
  formula: {
    producto1: { nombre: string } | null;
    porcentaje1: number | null;
    producto2: { nombre: string } | null;
    porcentaje2: number | null;
    producto3: { nombre: string } | null;
    porcentaje3: number | null;
    producto4: { nombre: string } | null;
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
        profundidadSemilla: { not: 0 },
        ...(devIds.includes(requesterId) ? {} : { id: { notIn: devIds } }),
      },
      include: {
        formula: {
          include: {
            producto1: { select: { nombre: true } },
            producto2: { select: { nombre: true } },
            producto3: { select: { nombre: true } },
            producto4: { select: { nombre: true } },
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
        formula: {
          include: {
            producto1: { select: { nombre: true } },
            producto2: { select: { nombre: true } },
            producto3: { select: { nombre: true } },
            producto4: { select: { nombre: true } },
          },
        },
        user: { select: { username: true } },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.SiembraPartidasUpdateInput,
  ): Promise<SiembraPartidas> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async findPendingSiembraPartidas(
    requesterId: string,
  ): Promise<SiembraPartidasWithRelations[]> {
    const devIds = await this.getDevAccounts();

    return this.prisma.siembraPartidas.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        profundidadSemilla: 0,
        ...(devIds.includes(requesterId)
          ? {}
          : {
              id: { notIn: devIds },
            }),
      },
      include: {
        formula: {
          include: {
            producto1: { select: { nombre: true } },
            producto2: { select: { nombre: true } },
            producto3: { select: { nombre: true } },
            producto4: { select: { nombre: true } },
          },
        },
        user: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
