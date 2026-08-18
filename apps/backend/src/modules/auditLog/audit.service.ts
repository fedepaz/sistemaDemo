// src/modules/auditLog/audit.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { AuditActionType, EntityType } from '../../generated/prisma/enums';
import { AuditLogRepository } from './repositories/auditLog.repository';
import {
  AuditEvent,
  AuditCrudEvent,
  AuditAccessEvent,
  AuditAuthEvent,
  AuditSecurityEvent,
  isAuditCrudEvent,
  isAuditAccessEvent,
  isAuditAuthEvent,
  isAuditSecurityEvent,
} from './events/audit.events';

const ACTION_MAP: Record<string, AuditActionType> = {
  CREATE: AuditActionType.CREATE,
  UPDATE: AuditActionType.UPDATE,
  DELETE: AuditActionType.DELETE,
  ACCESS: AuditActionType.ACCESS,
  LOGIN: AuditActionType.LOGIN,
  LOGOUT: AuditActionType.LOGOUT,
  LOGIN_FAILED: AuditActionType.LOGIN_FAILED,
  PASSWORD_CHANGE: AuditActionType.PASSWORD_CHANGE,
  PROFILE_UPDATE: AuditActionType.PROFILE_UPDATE,
  MFA_ENABLE: AuditActionType.MFA_ENABLE,
  MFA_DISABLE: AuditActionType.MFA_DISABLE,
};

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async logEvent(event: AuditEvent): Promise<void> {
    try {
      const action = ACTION_MAP[event.action];
      if (!action) {
        this.logger.warn(`Unknown audit action: ${event.action}`);
        return;
      }

      const entityType = this.resolveEntityType(event);

      const changes = this.buildChanges(event);

      // Coerce placeholder identities to null. AuditLog.tenantId/userId are
      // nullable: anonymous events (e.g. LOGIN_FAILED for an unknown username)
      // must not try to write fake values that violate the foreign keys.
      await this.auditLogRepository.createAuditLog({
        tenantId: this.nullIfPlaceholder(event.tenantId),
        userId: this.nullIfPlaceholder(event.userId),
        action,
        entityType,
        entityId: event.entityId,
        changes,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
      });

      this.logger.debug(
        `AUDIT | ${event.action} ${entityType} (${event.entityId}) | ` +
          `User: ${event.userId}`,
      );
    } catch (err: unknown) {
      this.logger.error({ err, event }, 'Failed to persist audit event');
    }
  }

  private nullIfPlaceholder(value: string): string | null {
    const placeholders = new Set(['unknown', 'anonymous', '']);
    return placeholders.has(value) ? null : value;
  }

  private resolveEntityType(event: AuditEvent): EntityType {
    const key = event.entityType.toLowerCase();

    const domainMap: Record<string, EntityType> = {
      user: EntityType.USER,
      tenant: EntityType.TENANT,
      role: EntityType.ROLE,
      locale: EntityType.LOCALE,
      message: EntityType.MESSAGE,
      preference: EntityType.USER_PREFERENCE,
    };
    if (domainMap[key]) return domainMap[key];

    // Also accept raw EntityType enum values (e.g. "AUDIT_LOG", "USER_PREFERENCE")
    // so types resolved in the interceptor are not lost on their way here.
    const enumMatch = Object.values(EntityType).find(
      (value) => value.toLowerCase() === key,
    );
    return enumMatch ?? EntityType.UNKNOWN;
  }

  private buildChanges(event: AuditEvent): Record<string, unknown> {
    if (isAuditCrudEvent(event)) {
      return this.buildCrudChanges(event);
    }

    if (isAuditAccessEvent(event)) {
      return this.buildAccessChanges(event);
    }

    if (isAuditAuthEvent(event)) {
      return this.buildAuthChanges(event);
    }

    if (isAuditSecurityEvent(event)) {
      return this.buildSecurityChanges(event);
    }

    return {};
  }

  private buildCrudChanges(event: AuditCrudEvent): Record<string, unknown> {
    return {
      requestId: event.changes.requestId,
      endpoint: event.changes.endpoint,
      method: event.changes.method,
      params: event.changes.params,
      query: event.changes.query,
      body: event.changes.body,
      affected: event.changes.affected,
      durationMs: event.changes.durationMs,
      timestamp: event.timestamp.toISOString(),
    };
  }

  private buildAccessChanges(event: AuditAccessEvent): Record<string, unknown> {
    return {
      requestId: event.changes.requestId,
      endpoint: event.changes.endpoint,
      method: event.changes.method,
      status: event.changes.status,
      message: event.changes.message,
      exceptionType: event.changes.exceptionType,
      timestamp: event.timestamp.toISOString(),
    };
  }

  private buildAuthChanges(event: AuditAuthEvent): Record<string, unknown> {
    return {
      reason: event.changes.reason,
      mfaUsed: event.changes.mfaUsed,
      timestamp: event.timestamp.toISOString(),
    };
  }

  private buildSecurityChanges(
    event: AuditSecurityEvent,
  ): Record<string, unknown> {
    return {
      fields: event.changes.fields,
      timestamp: event.timestamp.toISOString(),
    };
  }

  async findAll(skip: number = 0, take: number = 50) {
    return this.auditLogRepository.findAllPaginated(skip, take);
  }

  async findAllByTenantName(
    tenantName: string,
    skip: number = 0,
    take: number = 50,
  ) {
    return this.auditLogRepository.findAllByTenantName(tenantName, skip, take);
  }

  async findAllByUserId(userId: string, skip: number = 0, take: number = 50) {
    return this.auditLogRepository.findAllByUserId(userId, skip, take);
  }
}
