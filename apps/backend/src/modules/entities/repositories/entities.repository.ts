// src/modules/entities/repositories/entities.repository.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import { Entity, PermissionScope } from '../../../generated/prisma/client';
import { BaseRepository } from '../../../shared/baseModule/base.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { CreateEntityDto } from '@vivero/shared';

@Injectable()
export class EntitiesRepository extends BaseRepository<Entity> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.entity);
  }

  async create(data: CreateEntityDto): Promise<Entity> {
    // 1. Create the entity using the BaseRepository.create
    const entity = await super.create(data);

    // 2. Grant permissions to ALL developer accounts
    const devAccounts = await this.prisma.devAccount.findMany({
      select: {
        userId: true,
      },
    });

    const devIds = devAccounts.map((record) => record.userId);

    if (devIds.length > 0) {
      await this.prisma.userPermission.createMany({
        data: devIds.map((userId) => ({
          userId,
          entityId: entity.id,
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
          scope: PermissionScope.ALL,
          permissionType: entity.permissionType,
        })),
        skipDuplicates: true,
      });
    }

    return entity;
  }

  async findByName(name: string): Promise<Entity> {
    const response = await this.model.findFirst({
      where: {
        name,
        deletedAt: null,
        isActive: true,
      },
    });
    if (!response) {
      throw new BadRequestException(`Entity ${name} not found`);
    }
    return response;
  }
}
