// src/modules/auditLog/auditLog.service.ts

import { Injectable } from '@nestjs/common';
import { AuditService } from './audit.service';

@Injectable()
export class AuditLogService {
  constructor(private auditService: AuditService) {}

  async getAllAuditLogs(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    return this.auditService.findAll(skip, limit);
  }

  async getAllByTenantName(
    tenantName: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const skip = (page - 1) * limit;
    return this.auditService.findAllByTenantName(tenantName, skip, limit);
  }

  async getAllByUserId(userId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    return this.auditService.findAllByUserId(userId, skip, limit);
  }
}
