// src/modules/permissions/repositories/entities.repository.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import { Entity } from '../../../generated/prisma/client';
import { BaseRepository } from '../../../shared/baseModule/base.repository';
import { PrismaService } from 'src/infra/prisma/prisma.service';

@Injectable()
export class EntitiesRepository extends BaseRepository<Entity> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.entity);
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
