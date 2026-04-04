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

  async findManyByUserId(
    userId: string,
    requesterId: string,
  ): Promise<UserPermissionRecord[]> {
    const devIds = await this.getDevAccounts();

    if (devIds.includes(requesterId)) {
      const recordsDev = await this.prisma.userPermission.findMany({
        where: {
          userId,
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
      return recordsDev
        .filter((r) => r.entity !== null)
        .map((r) => ({
          ...r,
          entityName: r.entity.name,
          createdAt: r.createdAt,
        }));
    }

    const records = await this.prisma.userPermission.findMany({
      where: {
        deletedAt: null,
        userId: {
          notIn: devIds,
        },
        user: {
          deletedAt: null,
          isActive: true,
        },
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

  async findManyByEntityId(
    entityId: string,
    requesterId: string,
  ): Promise<UserPermissionRecord[]> {
    const devIds = await this.getDevAccounts();

    if (devIds.includes(requesterId)) {
      const recordsDev = await this.prisma.userPermission.findMany({
        where: {
          entityId,
        },
        select: {
          userId: true,
          entityId: true,
          entity: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
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

      return recordsDev.map((r) => ({
        ...r,
        entityName: r.entity.name,
        userMetadata: {
          username: r.user.username,
          firstName: r.user.firstName,
          lastName: r.user.lastName,
        },
        createdAt: r.createdAt,
      }));
    }
    const records = await this.prisma.userPermission.findMany({
      where: {
        entityId,
        deletedAt: null,
        userId: {
          notIn: devIds,
        },
        user: {
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
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
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

    return records.map((r) => ({
      ...r,
      entityName: r.entity.name,
      userMetadata: {
        username: r.user.username,
        firstName: r.user.firstName,
        lastName: r.user.lastName,
      },
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
