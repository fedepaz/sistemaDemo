// src/modules/auditLog/events/audit-event.emitter.ts

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AuditCrudEvent,
  AuditAccessEvent,
  AuditAuthEvent,
  AuditSecurityEvent,
} from './audit.events';

export const AUDIT_EVENTS = {
  CRUD: 'audit.crud',
  ACCESS: 'audit.access',
  AUTH: 'audit.auth',
  SECURITY: 'audit.security',
} as const;

@Injectable()
export class AuditEventEmitter {
  private readonly logger = new Logger(AuditEventEmitter.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitCrud(event: AuditCrudEvent): void {
    this.eventEmitter.emit(AUDIT_EVENTS.CRUD, event);
    this.logger.debug(
      `Emitted ${AUDIT_EVENTS.CRUD} | ${event.action} ${event.entityType} (${event.entityId})`,
    );
  }

  emitAccess(event: AuditAccessEvent): void {
    this.eventEmitter.emit(AUDIT_EVENTS.ACCESS, event);
    this.logger.debug(
      `Emitted ${AUDIT_EVENTS.ACCESS} | ${event.changes.endpoint} ${event.changes.method}`,
    );
  }

  emitAuth(event: AuditAuthEvent): void {
    this.eventEmitter.emit(AUDIT_EVENTS.AUTH, event);
    this.logger.debug(
      `Emitted ${AUDIT_EVENTS.AUTH} | ${event.action} for user ${event.userId}`,
    );
  }

  emitSecurity(event: AuditSecurityEvent): void {
    this.eventEmitter.emit(AUDIT_EVENTS.SECURITY, event);
    this.logger.debug(
      `Emitted ${AUDIT_EVENTS.SECURITY} | ${event.action} for user ${event.userId}`,
    );
  }
}
