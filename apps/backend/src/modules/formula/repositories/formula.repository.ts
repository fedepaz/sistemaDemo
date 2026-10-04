// src/modules/formula/repositories/formula.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { BaseRepository } from '../../../shared/baseModule/base.repository';
import { CreateFormulaDto, FormulaDto } from '@vivero/shared';
import { Formula } from '../../../generated/prisma/client';

export type FormulaWithRelations = Formula & {
  producto1: { nombre: string } | null;
  producto2: { nombre: string } | null;
  producto3: { nombre: string } | null;
  producto4: { nombre: string } | null;
};

export type FormulaRecord = Formula & FormulaDto;

const PRODUCTO_INCLUDE = {
  producto1: { select: { nombre: true } },
  producto2: { select: { nombre: true } },
  producto3: { select: { nombre: true } },
  producto4: { select: { nombre: true } },
};

@Injectable()
export class FormulaRepository extends BaseRepository<Formula> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.formula);
  }

  private mapRow(row: FormulaWithRelations): FormulaRecord {
    const { producto1, producto2, producto3, producto4, ...formula } = row;
    return {
      ...formula,
      producto1Nombre: producto1!.nombre,
      producto2Nombre: producto2?.nombre ?? null,
      producto3Nombre: producto3?.nombre ?? null,
      producto4Nombre: producto4?.nombre ?? null,
      deletedByUsername: null,
    };
  }

  override async findAll(requesterId: string): Promise<FormulaRecord[]> {
    const devIds = await this.getDevAccounts();
    const isDev = devIds.includes(requesterId);

    const rows: FormulaWithRelations[] = await this.prisma.formula.findMany({
      where: isDev
        ? {}
        : { deletedAt: null, isActive: true, id: { notIn: devIds } },
      include: PRODUCTO_INCLUDE,
    });

    return this.enrichDeletedBy(rows.map((r) => this.mapRow(r)));
  }

  override async findById(
    id: string,
    requesterId: string,
  ): Promise<FormulaRecord | null> {
    const devIds = await this.getDevAccounts();
    const isDev = devIds.includes(requesterId);

    const row = (await this.prisma.formula.findUnique({
      where: { id },
      include: PRODUCTO_INCLUDE,
    })) as FormulaWithRelations | null;

    if (!row) return null;
    if (!isDev && (row.deletedAt !== null || !row.isActive)) return null;

    return (await this.enrichDeletedBy([this.mapRow(row)]))[0];
  }

  override async create(data: CreateFormulaDto): Promise<FormulaRecord> {
    const created = await this.prisma.formula.create({ data });

    const row = (await this.prisma.formula.findUnique({
      where: { id: created.id },
      include: PRODUCTO_INCLUDE,
    })) as FormulaWithRelations | null;

    if (!row) {
      throw new Error(`Formula ${created.id} not found right after create`);
    }

    return (await this.enrichDeletedBy([this.mapRow(row)]))[0];
  }
}
