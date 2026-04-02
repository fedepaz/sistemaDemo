// src/shared/baseModule/base.repository.ts

import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

export interface SoftDeletableModel {
  id: string;
  deletedAt: Date | null;
  isActive: boolean;
  deletedByUserId: string | null;
}

interface PrismaModelDelegate<T> {
  findMany(args?: any): Promise<T[]>;
  findFirst(args: any): Promise<T | null>;
  update(args: any): Promise<T>;
  create(args: any): Promise<T>;
}

export abstract class BaseRepository<T extends SoftDeletableModel> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly model: PrismaModelDelegate<T>,
  ) {}

  private devAccounts: string[] | null = null;
  private async getDevAccounts(): Promise<string[]> {
    if (this.devAccounts) return this.devAccounts;
    const records = await this.prisma.devAccount.findMany({
      select: {
        userId: true,
      },
    });
    this.devAccounts = records.map((record) => record.userId);
    return this.devAccounts;
  }

  async findAll(requesterId: string): Promise<T[]> {
    const devIds = await this.getDevAccounts();

    if (devIds.includes(requesterId)) {
      return this.model.findMany();
    }
    return this.model.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        id: {
          notIn: devIds,
        },
      },
    });
  }

  async findById(id: string, requesterId: string): Promise<T | null> {
    const devIds = await this.getDevAccounts();

    if (devIds.includes(requesterId)) {
      return this.model.findFirst({
        where: {
          id,
        },
      });
    }
    return this.model.findFirst({
      where: {
        id: {
          notIn: devIds,
        },
        deletedAt: null,
        isActive: true,
      },
    });
  }

  async softDelete(id: string, deletedByUserId: string): Promise<T> {
    return this.model.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
        isActive: false,
      },
    });
  }

  async recover(id: string, requesterId: string): Promise<T> {
    const devIds = await this.getDevAccounts();

    if (!devIds.includes(requesterId)) {
      throw new ForbiddenException('Only dev accounts can recover records');
    }
    return this.model.update({
      where: { id },
      data: {
        deletedAt: null,
        isActive: true,
        updatedAt: new Date(),
      },
    });
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}
