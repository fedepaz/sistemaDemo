// src/modules/productos/repositories/productos.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import {
  BaseRepository,
  WithDeletedBy,
} from '../../../shared/baseModule/base.repository';
import { Producto } from '../../../generated/prisma/client';

@Injectable()
export class ProductosRepository extends BaseRepository<Producto> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.producto);
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

  override async findAll(
    requesterId: string,
  ): Promise<WithDeletedBy<Producto>[]> {
    return this.enrichDeletedBy(await super.findAll(requesterId));
  }

  override async findById(
    id: string,
    requesterId: string,
  ): Promise<WithDeletedBy<Producto> | null> {
    const row = await super.findById(id, requesterId);
    if (!row) return null;
    return (await this.enrichDeletedBy([row]))[0];
  }
}
