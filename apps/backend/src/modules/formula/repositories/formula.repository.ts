// src/modules/formula/repositories/formula.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { CreateFormulaDto, FormulaDto } from '@vivero/shared';

@Injectable()
export class FormulaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(_requesterId: string): Promise<FormulaDto[]> {
    const rows = await this.prisma.formula.findMany({
      where: { deletedAt: null },
      include: {
        producto1: { select: { nombre: true } },
        producto2: { select: { nombre: true } },
        producto3: { select: { nombre: true } },
        producto4: { select: { nombre: true } },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      producto1Id: r.producto1Id,
      producto1Nombre: r.producto1.nombre,
      porcentaje1: r.porcentaje1,
      producto2Id: r.producto2Id,
      producto2Nombre: r.producto2?.nombre ?? null,
      porcentaje2: r.porcentaje2,
      producto3Id: r.producto3Id,
      producto3Nombre: r.producto3?.nombre ?? null,
      porcentaje3: r.porcentaje3,
      producto4Id: r.producto4Id,
      producto4Nombre: r.producto4?.nombre ?? null,
      porcentaje4: r.porcentaje4,
      isActive: r.isActive,
      createdAt: r.createdAt,
    }));
  }

  async findById(id: string, _requesterId: string): Promise<FormulaDto | null> {
    const row = await this.prisma.formula.findUnique({
      where: { id },
      include: {
        producto1: { select: { nombre: true } },
        producto2: { select: { nombre: true } },
        producto3: { select: { nombre: true } },
        producto4: { select: { nombre: true } },
      },
    });

    if (!row || row.deletedAt) return null;

    return {
      id: row.id,
      producto1Id: row.producto1Id,
      producto1Nombre: row.producto1.nombre,
      porcentaje1: row.porcentaje1,
      producto2Id: row.producto2Id,
      producto2Nombre: row.producto2?.nombre ?? null,
      porcentaje2: row.porcentaje2,
      producto3Id: row.producto3Id,
      producto3Nombre: row.producto3?.nombre ?? null,
      porcentaje3: row.porcentaje3,
      producto4Id: row.producto4Id,
      producto4Nombre: row.producto4?.nombre ?? null,
      porcentaje4: row.porcentaje4,
      isActive: row.isActive,
      createdAt: row.createdAt,
    };
  }

  async create(data: CreateFormulaDto) {
    return this.prisma.formula.create({ data });
  }
}
