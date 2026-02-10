// src/shared/baseModule/base.repository.ts

import { PrismaService } from 'src/infra/prisma/prisma.service';

export interface SoftDeletableModel {
  deletedAt: Date | null;
  isActive: boolean;
  deletedByUserId: string | null;
}
interface PrismaModel<T> {
  findMany(args?: any): Promise<T[]>;
  findFirst(args: any): Promise<T | null>;
  update(args: any): Promise<T>;
}

export abstract class BaseRepository<T extends SoftDeletableModel> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly model: PrismaModel<T>,
  ) {}

  findAll(): Promise<T[]> {
    return this.model.findMany({
      where: { deletedAt: null, isActive: true },
    });
  }

  findAllAdmin(): Promise<T[]> {
    return this.model.findMany();
  }

  findById(id: string): Promise<T | null> {
    return this.model.findFirst({
      where: {
        id,
        deletedAt: null,
        isActive: true,
      },
    });
  }

  softDelete(id: string, deletedByUserId: string): Promise<T> {
    return this.model.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
        isActive: false,
      },
    });
  }

  recover(id: string): Promise<T> {
    return this.model.update({
      where: { id },
      data: {
        deletedAt: null,
        isActive: true,
        updatedAt: new Date(),
      },
    });
  }
}
