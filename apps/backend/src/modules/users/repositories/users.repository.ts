// app/modules/users/repositories/users.repository.ts

import {
  Injectable,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UpdateUserProfileDto } from '@vivero/shared';
import { User } from '../../../generated/prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { BaseRepository } from '../../../shared/baseModule/base.repository';

// passwordHash must NEVER be returned to the client. Every query here omits it.
const OMIT_PASSWORD_HASH = { passwordHash: true } as const;

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  private readonly logger = new Logger(UsersRepository.name);
  constructor(prisma: PrismaService) {
    super(prisma, prisma.user);
  }

  async findAll(requesterId: string): Promise<User[]> {
    const devIds = await this.getDevAccounts();
    if (devIds.includes(requesterId)) {
      return this.model.findMany({ omit: OMIT_PASSWORD_HASH });
    }
    return this.model.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        id: { notIn: devIds },
      },
      omit: OMIT_PASSWORD_HASH,
    });
  }

  async findById(id: string, requesterId: string): Promise<User | null> {
    const devIds = await this.getDevAccounts();
    if (devIds.includes(requesterId)) {
      return this.model.findFirst({
        where: { id },
        omit: OMIT_PASSWORD_HASH,
      });
    }
    return this.model.findFirst({
      where: { id, deletedAt: null, isActive: true },
      omit: OMIT_PASSWORD_HASH,
    });
  }

  async softDelete(id: string, deletedByUserId: string): Promise<User> {
    return this.model.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId,
        isActive: false,
      },
      omit: OMIT_PASSWORD_HASH,
    });
  }

  async recover(id: string, requesterId: string): Promise<User> {
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
      omit: OMIT_PASSWORD_HASH,
    });
  }

  updateProfile(id: string, data: UpdateUserProfileDto) {
    return this.model.update({
      where: {
        id,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      omit: OMIT_PASSWORD_HASH,
    });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.model.findFirst({
      where: {
        username,
        deletedAt: null,
        isActive: true,
      },
      omit: OMIT_PASSWORD_HASH,
    });
  }

  findByTenantId(tenantId: string): Promise<User[]> {
    return this.model.findMany({
      where: {
        tenantId,
        deletedAt: null,
        isActive: true,
      },
      omit: OMIT_PASSWORD_HASH,
    });
  }

  async findToActivate(requesterId: string): Promise<User[]> {
    const devIds = await this.getDevAccounts();
    if (devIds.includes(requesterId)) {
      return this.model.findMany({
        where: {
          deletedAt: null,
          isActive: false,
        },
        omit: OMIT_PASSWORD_HASH,
      });
    }
    return this.model.findMany({
      where: {
        deletedAt: null,
        isActive: false,
        id: { notIn: devIds },
      },
      omit: OMIT_PASSWORD_HASH,
    });
  }

  async activateById(id: string): Promise<void> {
    try {
      await this.model.update({
        where: {
          id,
        },
        data: {
          isActive: true,
          updatedAt: new Date(),
        },
        omit: OMIT_PASSWORD_HASH,
      });
    } catch (error) {
      this.logger.error('Error activating user:', error);
      throw new InternalServerErrorException('Error activating user');
    }
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
      omit: OMIT_PASSWORD_HASH,
    });
  }
}
