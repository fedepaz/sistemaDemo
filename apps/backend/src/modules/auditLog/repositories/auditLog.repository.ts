// src/modules/auditLog/repositories/auditLog.repository.ts

import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  AuditActionType,
  AuditLog,
  EntityType,
} from '../../../generated/prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { BaseRepository } from '../../../shared/baseModule/base.repository';

@Injectable()
export class AuditLogRepository extends BaseRepository<AuditLog> {
  private readonly logger = new Logger(AuditLogRepository.name);

  constructor(prisma: PrismaService) {
    super(prisma, prisma.auditLog);
  }

  async findAllPaginated(
    skip: number = 0,
    take: number = 50,
  ): Promise<AuditLog[]> {
    const include = {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
    };

    return this.prisma.auditLog.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
      include,
      skip,
      take,
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  findAllByTenantName(
    tenantName: string,
    skip: number = 0,
    take: number = 50,
  ): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: {
        tenant: {
          name: tenantName,
        },
        deletedAt: null,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      skip,
      take,
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  findAllByUserId(
    userId: string,
    skip: number = 0,
    take: number = 50,
  ): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: {
        userId,
        deletedAt: null,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      skip,
      take,
    });
  }

  async createAuditLog(data: {
    tenantId: string | null;
    userId: string | null;
    action: AuditActionType;
    entityType: EntityType;
    entityId: string;
    changes: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    try {
      const auditLog = await this.prisma.auditLog.create({
        data,
      });

      return auditLog;
    } catch (error) {
      this.logger.error('Error creating audit log:', error);
      throw new InternalServerErrorException('Error creating audit log');
    }
  }
}
