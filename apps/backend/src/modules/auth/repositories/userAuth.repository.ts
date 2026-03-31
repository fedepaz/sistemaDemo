// src/auth/user/userAuth.repository.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  User,
  Tenant,
  PermissionScope,
  PermissionType,
} from '../../../generated/prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';

@Injectable()
export class UserAuthRepository {
  constructor(private prisma: PrismaService) {}

  findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        username,
        isActive: true,
        tenant: {
          deletedAt: null,
        },
      },
    });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
        isActive: true,
        tenant: {
          deletedAt: null,
        },
      },
    });
  }

  findTenantById(id: string): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async createUser(data: {
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    passwordHash: string;
    tenantId: string;
  }): Promise<User> {
    try {
      return this.prisma.$transaction(async (tx) => {
        const profileEntity = await tx.entity.upsert({
          where: { name: 'user_profile' },
          create: {
            name: 'user_profile',
            label: 'Perfil de usuario',
            permissionType: PermissionType.READ_ONLY,
          },
          update: {},
        });
        const user = await tx.user.create({
          data: {
            ...data,
            isActive: true,
          },
        });

        await tx.userPermission.upsert({
          where: {
            userId_entityId: {
              userId: user.id,
              entityId: profileEntity.id,
            },
          },
          create: {
            userId: user.id,
            entityId: profileEntity.id,
            canRead: true,
            scope: PermissionScope.ALL,
            permissionType: PermissionType.READ_ONLY,
          },
          update: { canRead: true },
        });
        return user;
      });
    } catch (error) {
      console.error('Error granting user permissions:', error);
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating password:', error);
      throw new InternalServerErrorException('Error updating password');
    }
  }
}
