// src/modules/auditLog/repositories/auditLog.repository.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  AuditActionType,
  AuditLog,
  EntityType,
} from '../../../generated/prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { BaseRepository } from '../../../shared/baseModule/base.repository';

@Injectable()
export class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.auditLog);
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
      },
      skip,
      take,
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  findAllByUserId(userId: string): Promise<AuditLog[] | null> {
    return this.prisma.auditLog.findMany({
      where: {
        userId,
      },
    });
  }

  async createAuditLog(data: {
    tenantId: string;
    userId: string;
    action: AuditActionType;
    entityType: EntityType;
    entityId: string;
    changes: Record<string, any>;
  }): Promise<AuditLog> {
    try {
      const auditLog = await this.prisma.auditLog.create({
        data,
      });

      return auditLog;
    } catch (error) {
      console.error('Error creating audit log:', error);
      throw new InternalServerErrorException('Error creating audit log');
    }
  }
}
