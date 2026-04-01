// src/modules/permissions/repositories/permissions.repository.ts

import { Injectable } from '@nestjs/common';
import {
  IPermissionRepository,
  UserPermissionRecord,
} from '../interfaces/permission.interface';
import { PrismaService } from '../../../infra/prisma/prisma.service';

@Injectable()
export class PermissionsRepository implements IPermissionRepository {
  constructor(private prisma: PrismaService) {}

  async findManyByUserId(userId: string): Promise<UserPermissionRecord[]> {
    const records = await this.prisma.userPermission.findMany({
      where: {
        userId,
        deletedAt: null,
        entity: {
          deletedAt: null,
          isActive: true,
        },
      },
      select: {
        userId: true,
        entityId: true,
        entity: {
          select: {
            name: true,
          },
        },
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        scope: true,
        permissionType: true,
        createdAt: true,
      },
    });

    return records
      .filter((r) => r.entity !== null)
      .map((r) => ({
        ...r,
        entityName: r.entity.name,
        createdAt: r.createdAt,
      }));
  }

  async upsert(
    userId: string,
    entityId: string,
    data: Partial<{
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
      scope: 'NONE' | 'OWN' | 'ALL';
      permissionType: 'CRUD' | 'PROCESS' | 'READ_ONLY';
    }>,
  ): Promise<void> {
    await this.prisma.userPermission.upsert({
      where: { userId_entityId: { userId, entityId } },
      create: {
        userId,
        entityId,
        canCreate: data.canCreate ?? false,
        canRead: data.canRead ?? false,
        canUpdate: data.canUpdate ?? false,
        canDelete: data.canDelete ?? false,
        scope: data.scope ?? 'NONE',
        permissionType: data.permissionType ?? 'CRUD',
      },
      update: data,
    });
  }

  async deleteByUserIdTableName(
    userId: string,
    entityId: string,
  ): Promise<void> {
    await this.prisma.userPermission.delete({
      where: { userId_entityId: { userId, entityId } },
    });
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await this.prisma.userPermission.deleteMany({
      where: { userId },
    });
  }
}
