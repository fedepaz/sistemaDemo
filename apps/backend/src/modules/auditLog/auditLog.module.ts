// src/modules/auditLog/auditLog.module.ts

import { Module } from '@nestjs/common';
import { AuditLogController } from './auditLog.controller';
import { AuditLogService } from './auditLog.service';
import { AuditLogRepository } from './repositories/auditLog.repository';

@Module({
  controllers: [AuditLogController],
  providers: [AuditLogService, AuditLogRepository],
})
export class AuditLogModule {}
