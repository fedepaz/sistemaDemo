// src/modules/mezcla/repositories/mezcla.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { CreateMezclaDto, MezclaDto } from '@vivero/shared';

@Injectable()
export class MezclaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(_requesterId: string): Promise<MezclaDto[]> {
    const rows = await this.prisma.mezcla.findMany({
      where: { deletedAt: null },
      include: {
        sustrato1: { select: { nombre: true } },
        sustrato2: { select: { nombre: true } },
        sustrato3: { select: { nombre: true } },
        sustrato4: { select: { nombre: true } },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      sustrato1Id: r.sustrato1Id,
      sustrato1Nombre: r.sustrato1.nombre,
      porcentaje1: r.porcentaje1,
      sustrato2Id: r.sustrato2Id,
      sustrato2Nombre: r.sustrato2?.nombre ?? null,
      porcentaje2: r.porcentaje2,
      sustrato3Id: r.sustrato3Id,
      sustrato3Nombre: r.sustrato3?.nombre ?? null,
      porcentaje3: r.porcentaje3,
      sustrato4Id: r.sustrato4Id,
      sustrato4Nombre: r.sustrato4?.nombre ?? null,
      porcentaje4: r.porcentaje4,
      isActive: r.isActive,
      createdAt: r.createdAt,
    }));
  }

  async findById(id: string, _requesterId: string): Promise<MezclaDto | null> {
    const row = await this.prisma.mezcla.findUnique({
      where: { id },
      include: {
        sustrato1: { select: { nombre: true } },
        sustrato2: { select: { nombre: true } },
        sustrato3: { select: { nombre: true } },
        sustrato4: { select: { nombre: true } },
      },
    });

    if (!row || row.deletedAt) return null;

    return {
      id: row.id,
      sustrato1Id: row.sustrato1Id,
      sustrato1Nombre: row.sustrato1.nombre,
      porcentaje1: row.porcentaje1,
      sustrato2Id: row.sustrato2Id,
      sustrato2Nombre: row.sustrato2?.nombre ?? null,
      porcentaje2: row.porcentaje2,
      sustrato3Id: row.sustrato3Id,
      sustrato3Nombre: row.sustrato3?.nombre ?? null,
      porcentaje3: row.porcentaje3,
      sustrato4Id: row.sustrato4Id,
      sustrato4Nombre: row.sustrato4?.nombre ?? null,
      porcentaje4: row.porcentaje4,
      isActive: row.isActive,
      createdAt: row.createdAt,
    };
  }

  async create(data: CreateMezclaDto) {
    return this.prisma.mezcla.create({ data });
  }
}
