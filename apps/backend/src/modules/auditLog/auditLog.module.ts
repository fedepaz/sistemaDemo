// src/modules/auditLog/auditLog.module.ts

import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuditLogController } from './auditLog.controller';
import { AuditLogService } from './auditLog.service';
import { AuditService } from './audit.service';
import { AuditLogRepository } from './repositories/auditLog.repository';
import { AuditEventEmitter } from './events/audit-event.emitter';
import { AuditEventListener } from './events/audit-event.listener';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [AuditLogController],
  providers: [
    AuditLogService,
    AuditService,
    AuditLogRepository,
    AuditEventEmitter,
    AuditEventListener,
  ],
  exports: [AuditService, AuditEventEmitter],
})
export class AuditLogModule {}
