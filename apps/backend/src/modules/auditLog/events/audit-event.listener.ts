import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditService } from '../audit.service';
import {
  AuditCrudEvent,
  AuditAccessEvent,
  AuditAuthEvent,
  AuditSecurityEvent,
} from './audit.events';
import { AUDIT_EVENTS } from './audit-event.emitter';

@Injectable()
export class AuditEventListener {
  private readonly logger = new Logger(AuditEventListener.name);

  constructor(private readonly auditService: AuditService) {}

  @OnEvent(AUDIT_EVENTS.CRUD)
  async handleCrudEvent(event: AuditCrudEvent): Promise<void> {
    this.logger.debug(
      `Handling ${AUDIT_EVENTS.CRUD} | ${event.action} ${event.entityType} (${event.entityId})`,
    );
    await this.auditService.logEvent(event);
  }

  @OnEvent(AUDIT_EVENTS.ACCESS)
  async handleAccessEvent(event: AuditAccessEvent): Promise<void> {
    this.logger.debug(
      `Handling ${AUDIT_EVENTS.ACCESS} | ${event.changes.endpoint} ${event.changes.method}`,
    );
    await this.auditService.logEvent(event);
  }

  @OnEvent(AUDIT_EVENTS.AUTH)
  async handleAuthEvent(event: AuditAuthEvent): Promise<void> {
    this.logger.debug(
      `Handling ${AUDIT_EVENTS.AUTH} | ${event.action} for user ${event.userId}`,
    );
    await this.auditService.logEvent(event);
  }

  @OnEvent(AUDIT_EVENTS.SECURITY)
  async handleSecurityEvent(event: AuditSecurityEvent): Promise<void> {
    this.logger.debug(
      `Handling ${AUDIT_EVENTS.SECURITY} | ${event.action} for user ${event.userId}`,
    );
    await this.auditService.logEvent(event);
  }
}
