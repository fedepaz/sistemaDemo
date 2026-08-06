export interface AuditEventBase {
  tenantId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditCrudEvent extends AuditEventBase {
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  changes: {
    requestId: string;
    endpoint: string;
    method: string;
    params: Record<string, unknown>;
    query: Record<string, unknown>;
    body: Record<string, unknown>;
    affected: { id: string } | { count: number } | null;
    durationMs: number;
  };
}

export interface AuditAccessEvent extends AuditEventBase {
  action: 'ACCESS';
  changes: {
    requestId: string;
    endpoint: string;
    method: string;
    status?: number;
    message?: string;
    exceptionType?: string;
  };
}

export interface AuditAuthEvent extends AuditEventBase {
  action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED';
  changes: {
    reason?: string;
    mfaUsed?: boolean;
  };
}

export interface AuditSecurityEvent extends AuditEventBase {
  action: 'PASSWORD_CHANGE' | 'PROFILE_UPDATE' | 'MFA_ENABLE' | 'MFA_DISABLE';
  changes: {
    fields: string[];
  };
}

export type AuditEvent =
  | AuditCrudEvent
  | AuditAccessEvent
  | AuditAuthEvent
  | AuditSecurityEvent;

export function isAuditCrudEvent(event: AuditEvent): event is AuditCrudEvent {
  return ['CREATE', 'UPDATE', 'DELETE'].includes(event.action);
}

export function isAuditAccessEvent(
  event: AuditEvent,
): event is AuditAccessEvent {
  return event.action === 'ACCESS';
}

export function isAuditAuthEvent(event: AuditEvent): event is AuditAuthEvent {
  return ['LOGIN', 'LOGOUT', 'LOGIN_FAILED'].includes(event.action);
}

export function isAuditSecurityEvent(
  event: AuditEvent,
): event is AuditSecurityEvent {
  return [
    'PASSWORD_CHANGE',
    'PROFILE_UPDATE',
    'MFA_ENABLE',
    'MFA_DISABLE',
  ].includes(event.action);
}
