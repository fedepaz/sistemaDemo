// src/modules/auditLog/auditLog.service.ts

import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from './repositories/auditLog.repository';

@Injectable()
export class AuditLogService {
  constructor(private auditLogRepository: AuditLogRepository) {}

  async getAllAuditLogs(requesterId: string) {
    const auditLogs = await this.auditLogRepository.findAll(requesterId);
    return auditLogs;
  }

  async getAllByTenantName(
    tenantName: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const skip = (page - 1) * limit;
    return this.auditLogRepository.findAllByTenantName(tenantName, skip, limit);
  }

  async getAllByUserId(userId: string) {
    return this.auditLogRepository.findAllByUserId(userId);
  }
}
