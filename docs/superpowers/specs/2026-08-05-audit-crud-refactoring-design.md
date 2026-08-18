# Audit CRUD Interceptor Refactoring Design

**Date:** 2026-08-05  
**Status:** Approved  
**Author:** opencode  

## Overview

Refactor the audit CRUD interceptor to create an enterprise-grade, production-ready audit logging system. The current implementation works but needs improvements for reliability, completeness, and maintainability.

## Goals

1. Fix user data being undefined in audit logs
2. Auto-detect entity types from URL (remove hardcoded mapping)
3. Add authentication event tracking (login, logout, password changes, MFA)
4. Centralize audit logic in a single AuditService
5. Maintain completeness of raw data (JSON view)

## Architecture

### Current State
- Global interceptor handles CRUD audit logs (POST/PUT/PATCH/DELETE)
- Hardcoded `PATH_TO_ENTITY` mapping misses many entities
- No auth event tracking
- User data often undefined

### Proposed Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Audit Events                          │
├─────────────────────────────────────────────────────────────┤
│  CRUD Interceptor    │  Auth Events    │  System Events    │
│  (existing, refactored) │  (new)           │  (new)           │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    AuditEventEmitter                        │
│            (NestJS EventEmitter2 module)                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    AuditService                             │
│        (single source of truth for all audit logs)          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Prisma (audit_logs table)                │
└─────────────────────────────────────────────────────────────┘
```

## Data Model Changes

### Schema Updates

```prisma
model AuditLog {
  id         String          @id @default(cuid())
  tenantId   String
  tenant     Tenant          @relation(fields: [tenantId], references: [id], onDelete: NoAction)
  userId     String
  user       User            @relation(fields: [userId], references: [id], onDelete: NoAction)
  isActive   Boolean         @default(true)
  
  // What happened
  action     AuditActionType
  entityType EntityType
  entityId   String
  
  // Details (raw JSON for completeness)
  changes    Json
  
  // Context
  timestamp  DateTime        @default(now())
  ipAddress  String?
  userAgent  String?
  
  // Soft delete
  deletedAt  DateTime?       @db.Timestamp(0)
  deletedByUserId String?

  @@index([action])
  @@index([tenantId, timestamp])
  @@index([userId])
  @@index([entityType, entityId])
  @@index([timestamp])
  @@map("audit_logs")
}
```

### New Enum Values

```prisma
enum AuditActionType {
  CREATE
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  LOGIN_FAILED
  PASSWORD_CHANGE
  PROFILE_UPDATE
  MFA_ENABLE
  MFA_DISABLE
}

enum EntityType {
  USER
  TENANT
  ROLE
  LOCALE
  MESSAGE
  USER_PREFERENCE
  AUDIT_LOG
  UNKNOWN
}
```

### Changes JSON Structure

```typescript
// Structured but still complete
changes: {
  // Context
  requestId: string
  endpoint: string
  method: string
  
  // Request data
  params: Record<string, unknown>
  query: Record<string, unknown>
  body: Record<string, unknown>  // sanitized
  
  // Response data
  affected: { id: string } | { count: number } | null
  
  // Metadata
  durationMs: number
  timestamp: string
}
```

## Component Design

### 1. AuditCrudInterceptor (Refactored)

**Key Changes:**
- Auto-detect entity type from URL (convert plural to singular, then to enum)
- Use request.user for user context (already available from auth middleware)
- Add request ID propagation
- Structured logging

**Entity Detection Logic:**
```typescript
private resolveEntityType(url: string): EntityType {
  const segments = url.split('/').filter(Boolean);
  for (const segment of segments) {
    const clean = segment.split('?')[0].toLowerCase();
    const singular = clean.endsWith('s') ? clean.slice(0, -1) : clean;
    const enumKey = singular.toUpperCase();
    if (Object.values(EntityType).includes(enumKey as EntityType)) {
      return enumKey as EntityType;
    }
  }
  return EntityType.UNKNOWN;
}
```

### 2. Audit Events (DTOs)

```typescript
export class AuditLoginEvent {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly ipAddress: string,
    public readonly userAgent: string,
    public readonly success: boolean,
    public readonly failureReason?: string,
  ) {}
}

export class AuditLogoutEvent {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
  ) {}
}

export class AuditPasswordChangeEvent {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly changedByUserId: string,
  ) {}
}
```

### 3. AuditEventEmitter

```typescript
@Injectable()
export class AuditEventEmitter {
  constructor(private eventEmitter: EventEmitter2) {}

  emitLogin(event: AuditLoginEvent) {
    this.eventEmitter.emit('audit.login', event);
  }

  emitLogout(event: AuditLogoutEvent) {
    this.eventEmitter.emit('audit.logout', event);
  }

  emitPasswordChange(event: AuditPasswordChangeEvent) {
    this.eventEmitter.emit('audit.password_change', event);
  }
}
```

### 4. AuditEventListener

```typescript
@Injectable()
export class AuditEventListener {
  constructor(private auditService: AuditService) {}

  @OnEvent('audit.login')
  async handleLogin(event: AuditLoginEvent) {
    await this.auditService.logAuthEvent({
      action: event.success ? AuditActionType.LOGIN : AuditActionType.LOGIN_FAILED,
      entityType: EntityType.USER,
      entityId: event.userId,
      userId: event.userId,
      tenantId: event.tenantId,
      changes: {
        success: event.success,
        failureReason: event.failureReason,
      },
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
    });
  }

  @OnEvent('audit.logout')
  async handleLogout(event: AuditLogoutEvent) {
    await this.auditService.logAuthEvent({
      action: AuditActionType.LOGOUT,
      entityType: EntityType.USER,
      entityId: event.userId,
      userId: event.userId,
      tenantId: event.tenantId,
      changes: {},
    });
  }
}
```

### 5. AuditService (Single Source of Truth)

```typescript
@Injectable()
export class AuditService {
  constructor(
    private prisma: PrismaService,
    private logger: Logger,
  ) {}

  async logCrudEvent(data: CrudAuditData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId: data.tenantId,
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          changes: data.changes,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      this.logger.error({
        err: error,
        action: data.action,
        entityType: data.entityType,
      }, 'Failed to save CRUD audit log');
    }
  }

  async logAuthEvent(data: AuthAuditData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId: data.tenantId,
          userId: data.userId,
          action: data.action,
          entityType: EntityType.USER,
          entityId: data.entityId,
          changes: data.changes,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      this.logger.error({
        err: error,
        action: data.action,
      }, 'Failed to save auth audit log');
    }
  }

  async findAll(filters?: AuditLogFilters): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        ...filters,
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
      orderBy: { timestamp: 'desc' },
    });
  }
}
```

### 6. Module Wiring

```typescript
@Module({
  imports: [
    EventEmitterModule.forRoot(),
  ],
  controllers: [AuditLogController],
  providers: [
    AuditLogService,
    AuditLogRepository,
    AuditService,
    AuditEventEmitter,
    AuditEventListener,
  ],
  exports: [AuditService, AuditEventEmitter],
})
export class AuditLogModule {}
```

## Integration Points

### AuthService

```typescript
constructor(
  private auditEventEmitter: AuditEventEmitter,
) {}

async login(dto: LoginDto) {
  // ... existing login logic
  
  this.auditEventEmitter.emitLogin(
    new AuditLoginEvent(userId, tenantId, ip, userAgent, true)
  );
}
```

### AuthController

```typescript
@Post('logout')
async logout(@Request() req) {
  this.auditEventEmitter.emitLogout(
    new AuditLogoutEvent(req.user.id, req.user.tenantId)
  );
  // ... existing logout logic
}
```

## Frontend Changes

1. **auditLogService.ts** — Ensure user data is included in responses
2. **columns.tsx** — Handle new event types (LOGIN, LOGOUT, etc.)
3. **auditLog-form.tsx** — Display auth event details

## Files to Modify

### Backend
- `apps/backend/prisma/schema/auditLog.prisma` — Add new enum values, index
- `apps/backend/src/shared/interceptors/audit-crud.interceptor.ts` — Refactor
- `apps/backend/src/modules/auditLog/auditLog.module.ts` — Add new providers
- `apps/backend/src/modules/auditLog/auditLog.service.ts` — Add AuditService
- `apps/backend/src/modules/auditLog/auditLog.repository.ts` — Update read methods
- `apps/backend/src/modules/auditLog/events/audit.events.ts` — NEW: Event DTOs
- `apps/backend/src/modules/auditLog/events/audit-event.emitter.ts` — NEW: Emitter
- `apps/backend/src/modules/auditLog/events/audit-event.listener.ts` — NEW: Listener
- `apps/backend/src/modules/auth/auth.service.ts` — Add audit events
- `apps/backend/src/modules/auth/auth.controller.ts` — Add audit events

### Frontend
- `apps/frontend/src/features/auditLogs/api/auditLogService.ts` — Ensure user data
- `apps/frontend/src/features/auditLogs/components/columns.tsx` — Handle new events
- `apps/frontend/src/features/auditLogs/components/auditLog-form.tsx` — Display auth events

## Testing Strategy

1. **Unit Tests:**
   - AuditService methods
   - AuditEventEmitter/Listener
   - Interceptor entity detection

2. **Integration Tests:**
   - CRUD operations generate audit logs
   - Auth events generate audit logs
   - User data is properly included

3. **E2E Tests:**
   - Full flow: login → CRUD → logout → verify audit logs

## Migration Strategy

1. Create migration for new enum values
2. Update interceptor (backward compatible)
3. Add event system (new functionality)
4. Update frontend (display improvements)
5. No data migration needed (existing logs remain valid)

## Success Criteria

1. ✅ User data always present in audit logs (no undefined)
2. ✅ All entities auto-detected from URL
3. ✅ Auth events tracked (login, logout, password changes)
4. ✅ Single AuditService for all audit operations
5. ✅ Enterprise-grade error handling (never breaks the app)
6. ✅ Complete raw data preserved (JSON view)

## Out of Scope

- Filtering/search capabilities (add later when needed)
- Data retention policies (indefinite for now)
- Dashboard analytics (future enhancement)
- Export capabilities (future enhancement)
