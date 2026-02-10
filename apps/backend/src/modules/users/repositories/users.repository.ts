// app/modules/users/repositories/users.repository.ts

import { Injectable } from '@nestjs/common';
import { UpdateUserProfileDto } from '@vivero/shared';
import { User } from '../../../generated/prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { BaseRepository } from 'src/shared/baseModule/base.repository';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.user);
  }

  updateProfile(id: string, data: UpdateUserProfileDto) {
    return this.model.update({
      where: {
        id,
      },
      data,
    });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.model.findFirst({
      where: {
        username,
        deletedAt: null,
        isActive: true,
      },
    });
  }

  findByTenantId(tenantId: string): Promise<User[]> {
    return this.model.findMany({
      where: {
        tenantId,
        deletedAt: null,
        isActive: true,
      },
    });
  }

  softDeleteByUsername(
    username: string,
    deletedByUserId: string,
  ): Promise<User> {
    return this.model.update({
      where: {
        username,
      },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
        isActive: false,
      },
    });
  }

  recoverById(id: string): Promise<User> {
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
