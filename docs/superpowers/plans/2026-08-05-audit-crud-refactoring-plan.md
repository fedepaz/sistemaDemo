# Audit CRUD Interceptor Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the audit CRUD interceptor into an enterprise-grade audit system with centralized service, event-driven auth tracking, and proper user context.

**Architecture:** Hybrid approach — keep global interceptor for CRUD operations, add EventEmitter2 for auth/system events, centralize all audit writes in AuditService.

**Tech Stack:** NestJS, Prisma, EventEmitter2, Zod

## Global Constraints

- All data types must be in `packages/shared/src/schemas/`
- Conventional Commits enforced by commitlint (feat, fix, docs, etc.)
- TDD: Tests before feature code
- Verify before committing: `pnpm lint && pnpm type-check && pnpm test`

---

## File Structure

### Files to Create
| File | Responsibility |
|------|----------------|
| `apps/backend/src/modules/auditLog/events/audit.events.ts` | Event DTOs (AuditLoginEvent, AuditLogoutEvent, etc.) |
| `apps/backend/src/modules/auditLog/events/audit-event.emitter.ts` | Wrapper around EventEmitter2 for audit events |
| `apps/backend/src/modules/auditLog/events/audit-event.listener.ts` | Listens to audit events, calls AuditService |
| `apps/backend/src/modules/auditLog/audit.service.ts` | Central audit service for all audit writes |

### Files to Modify
| File | Changes |
|------|---------|
| `apps/backend/prisma/schema/auditLog.prisma` | Add new enum values, add timestamp index |
| `apps/backend/prisma/schema.prisma` | Import updated auditLog schema |
| `apps/backend/src/shared/interceptors/audit-crud.interceptor.ts` | Refactor: auto-detect entity, use AuditService |
| `apps/backend/src/modules/auditLog/auditLog.module.ts` | Add new providers, EventEmitterModule |
| `apps/backend/src/modules/auditLog/auditLog.repository.ts` | Add user include to all read methods |
| `apps/backend/src/modules/auth/auth.service.ts` | Emit login/logout audit events |
| `apps/backend/src/modules/auth/auth.module.ts` | Import AuditLogModule |

---

## Tasks

### Task 1: Update Prisma Schema with New Enum Values

**Files:**
- Modify: `apps/backend/prisma/schema/auditLog.prisma`

**Interfaces:**
- Produces: Updated `AuditActionType` and `EntityType` enums

- [ ] **Step 1: Update AuditActionType enum**

Open `apps/backend/prisma/schema/auditLog.prisma` and replace the enum:

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
```

- [ ] **Step 2: Update EntityType enum**

```prisma
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

- [ ] **Step 3: Add timestamp index**

Add to the AuditLog model:

```prisma
  @@index([timestamp])
```

- [ ] **Step 4: Generate Prisma client**

Run: `pnpm --filter backend exec prisma generate`
Expected: Prisma client generated successfully

- [ ] **Step 5: Create migration**

Run: `pnpm --filter backend db:migrate:dev --name add-audit-event-types`
Expected: Migration created successfully

- [ ] **Step 6: Commit**

```bash
git add apps/backend/prisma/schema/auditLog.prisma
git commit -m "feat(audit): add auth event types to audit schema"
```

---

### Task 2: Create Audit Event DTOs

**Files:**
- Create: `apps/backend/src/modules/auditLog/events/audit.events.ts`

**Interfaces:**
- Produces: `AuditLoginEvent`, `AuditLogoutEvent`, `AuditPasswordChangeEvent` classes

- [ ] **Step 1: Create events file**

Create `apps/backend/src/modules/auditLog/events/audit.events.ts`:

```typescript
// apps/backend/src/modules/auditLog/events/audit.events.ts

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

export class AuditProfileUpdateEvent {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly updatedFields: Record<string, unknown>,
  ) {}
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/backend/src/modules/auditLog/events/audit.events.ts
git commit -m "feat(audit): add audit event DTOs"
```

---

### Task 3: Create AuditService

**Files:**
- Create: `apps/backend/src/modules/auditLog/audit.service.ts`

**Interfaces:**
- Consumes: `PrismaService`, `AuditActionType`, `EntityType`
- Produces: `AuditService` with `logCrudEvent()`, `logAuthEvent()`, `findAll()`

- [ ] **Step 1: Create AuditService**

Create `apps/backend/src/modules/auditLog/audit.service.ts`:

```typescript
// apps/backend/src/modules/auditLog/audit.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { AuditActionType, EntityType } from '../../../generated/prisma/enums';

export interface CrudAuditData {
  tenantId: string;
  userId: string;
  action: AuditActionType;
  entityType: EntityType;
  entityId: string;
  changes: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthAuditData {
  tenantId: string;
  userId: string;
  action: AuditActionType;
  entityType: EntityType;
  entityId: string;
  changes: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

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

      this.logger.debug(
        `CRUD AUDIT | ${data.action} ${data.entityType} (${data.entityId}) | User: ${data.userId}`,
      );
    } catch (error) {
      this.logger.error(
        { err: error, action: data.action, entityType: data.entityType },
        'Failed to save CRUD audit log',
      );
    }
  }

  async logAuthEvent(data: AuthAuditData): Promise<void> {
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

      this.logger.debug(
        `AUTH AUDIT | ${data.action} | User: ${data.userId}`,
      );
    } catch (error) {
      this.logger.error(
        { err: error, action: data.action },
        'Failed to save auth audit log',
      );
    }
  }

  async findAll(options?: {
    tenantId?: string;
    userId?: string;
    action?: AuditActionType;
    entityType?: EntityType;
    limit?: number;
    offset?: number;
  }) {
    const where = {
      deletedAt: null,
      isActive: true,
      ...(options?.tenantId && { tenantId: options.tenantId }),
      ...(options?.userId && { userId: options.userId }),
      ...(options?.action && { action: options.action }),
      ...(options?.entityType && { entityType: options.entityType }),
    };

    return this.prisma.auditLog.findMany({
      where,
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
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });
  }

  async findAllByTenantName(tenantName: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    return this.prisma.auditLog.findMany({
      where: {
        tenant: { name: tenantName },
        deletedAt: null,
        isActive: true,
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
      take: limit,
      skip,
    });
  }

  async findAllByUserId(userId: string) {
    return this.prisma.auditLog.findMany({
      where: {
        userId,
        deletedAt: null,
        isActive: true,
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

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm --filter backend exec tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/auditLog/audit.service.ts
git commit -m "feat(audit): add centralized AuditService"
```

---

### Task 4: Create Audit Event Emitter

**Files:**
- Create: `apps/backend/src/modules/auditLog/events/audit-event.emitter.ts`

**Interfaces:**
- Consumes: `EventEmitter2`, event DTOs from Task 2
- Produces: `AuditEventEmitter` with `emitLogin()`, `emitLogout()`, etc.

- [ ] **Step 1: Create emitter**

Create `apps/backend/src/modules/auditLog/events/audit-event.emitter.ts`:

```typescript
// apps/backend/src/modules/auditLog/events/audit-event.emitter.ts

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AuditLoginEvent,
  AuditLogoutEvent,
  AuditPasswordChangeEvent,
  AuditProfileUpdateEvent,
} from './audit.events';

@Injectable()
export class AuditEventEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitLogin(event: AuditLoginEvent): void {
    this.eventEmitter.emit('audit.login', event);
  }

  emitLogout(event: AuditLogoutEvent): void {
    this.eventEmitter.emit('audit.logout', event);
  }

  emitPasswordChange(event: AuditPasswordChangeEvent): void {
    this.eventEmitter.emit('audit.password_change', event);
  }

  emitProfileUpdate(event: AuditProfileUpdateEvent): void {
    this.eventEmitter.emit('audit.profile_update', event);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/backend/src/modules/auditLog/events/audit-event.emitter.ts
git commit -m "feat(audit): add AuditEventEmitter"
```

---

### Task 5: Create Audit Event Listener

**Files:**
- Create: `apps/backend/src/modules/auditLog/events/audit-event.listener.ts`

**Interfaces:**
- Consumes: `AuditService` from Task 3, event DTOs from Task 2
- Produces: Event handlers that call AuditService

- [ ] **Step 1: Create listener**

Create `apps/backend/src/modules/auditLog/events/audit-event.listener.ts`:

```typescript
// apps/backend/src/modules/auditLog/events/audit-event.listener.ts

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditService } from '../audit.service';
import { AuditActionType, EntityType } from '../../../../generated/prisma/enums';
import {
  AuditLoginEvent,
  AuditLogoutEvent,
  AuditPasswordChangeEvent,
  AuditProfileUpdateEvent,
} from './audit.events';

@Injectable()
export class AuditEventListener {
  private readonly logger = new Logger(AuditEventListener.name);

  constructor(private readonly auditService: AuditService) {}

  @OnEvent('audit.login')
  async handleLogin(event: AuditLoginEvent): Promise<void> {
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
  async handleLogout(event: AuditLogoutEvent): Promise<void> {
    await this.auditService.logAuthEvent({
      action: AuditActionType.LOGOUT,
      entityType: EntityType.USER,
      entityId: event.userId,
      userId: event.userId,
      tenantId: event.tenantId,
      changes: {},
    });
  }

  @OnEvent('audit.password_change')
  async handlePasswordChange(event: AuditPasswordChangeEvent): Promise<void> {
    await this.auditService.logAuthEvent({
      action: AuditActionType.PASSWORD_CHANGE,
      entityType: EntityType.USER,
      entityId: event.userId,
      userId: event.changedByUserId,
      tenantId: event.tenantId,
      changes: {
        targetUserId: event.userId,
      },
    });
  }

  @OnEvent('audit.profile_update')
  async handleProfileUpdate(event: AuditProfileUpdateEvent): Promise<void> {
    await this.auditService.logAuthEvent({
      action: AuditActionType.PROFILE_UPDATE,
      entityType: EntityType.USER,
      entityId: event.userId,
      userId: event.userId,
      tenantId: event.tenantId,
      changes: {
        updatedFields: event.updatedFields,
      },
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/backend/src/modules/auditLog/events/audit-event.listener.ts
git commit -m "feat(audit): add AuditEventListener for auth events"
```

---

### Task 6: Update AuditLog Module

**Files:**
- Modify: `apps/backend/src/modules/auditLog/auditLog.module.ts`

**Interfaces:**
- Consumes: AuditService, AuditEventEmitter, AuditEventListener from Tasks 3-5
- Produces: Updated module with all providers

- [ ] **Step 1: Update module**

Replace `apps/backend/src/modules/auditLog/auditLog.module.ts`:

```typescript
// apps/backend/src/modules/auditLog/auditLog.module.ts

import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuditLogController } from './auditLog.controller';
import { AuditLogService } from './auditLog.service';
import { AuditLogRepository } from './repositories/auditLog.repository';
import { AuditService } from './audit.service';
import { AuditEventEmitter } from './events/audit-event.emitter';
import { AuditEventListener } from './events/audit-event.listener';

@Module({
  imports: [EventEmitterModule.forRoot()],
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

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm --filter backend exec tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/auditLog/auditLog.module.ts
git commit -m "feat(audit): update AuditLogModule with new providers"
```

---

### Task 7: Refactor AuditCrudInterceptor

**Files:**
- Modify: `apps/backend/src/shared/interceptors/audit-crud.interceptor.ts`

**Interfaces:**
- Consumes: `AuditService` from Task 3
- Produces: Refactored interceptor with auto-detection and centralized logging

- [ ] **Step 1: Refactor interceptor**

Replace `apps/backend/src/shared/interceptors/audit-crud.interceptor.ts`:

```typescript
// apps/backend/src/shared/interceptors/audit-crud.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  Optional,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditActionType, EntityType } from '../../generated/prisma/enums';
import { AuditService } from '../../modules/auditLog/audit.service';

const METHOD_TO_ACTION: Record<string, AuditActionType> = {
  POST: AuditActionType.CREATE,
  PUT: AuditActionType.UPDATE,
  PATCH: AuditActionType.UPDATE,
  DELETE: AuditActionType.DELETE,
};

@Injectable()
export class AuditCrudInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditCrudInterceptor.name);

  constructor(
    @Optional()
    private readonly auditService?: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const action = METHOD_TO_ACTION[request.method];

    if (!action) {
      return next.handle();
    }

    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          this.saveAuditLog({
            request,
            action,
            responseBody,
            durationMs: Date.now() - startedAt,
          }).catch((err) =>
            this.logger.error({ err }, 'Failed to save CRUD audit log'),
          );
        },
        error: () => {
          // Errors are already handled by GlobalExceptionFilter
        },
      }),
    );
  }

  private async saveAuditLog({
    request,
    action,
    responseBody,
    durationMs,
  }: {
    request: Request;
    action: AuditActionType;
    responseBody: unknown;
    durationMs: number;
  }): Promise<void> {
    if (!this.auditService) {
      this.logger.warn('No AuditService, skipping CRUD audit log');
      return;
    }

    const userId = (request as any).user?.id ?? 'anonymous';
    const tenantId = (request as any).user?.tenantId ?? 'unknown';
    const ip = this.getClientIp(request);
    const userAgent = request.headers?.['user-agent'] ?? 'unknown';
    const entityType = this.resolveEntityType(request.url);
    const entityId = this.resolveEntityId(request, responseBody);
    const requestId = (request as any).requestId ?? 'unknown';

    const sanitizedBody = this.sanitizeBody(request.body);

    const changes = {
      requestId,
      endpoint: request.url,
      method: request.method,
      params: request.params,
      query: request.query,
      body: sanitizedBody,
      affected: this.extractAffected(responseBody),
      durationMs,
      timestamp: new Date().toISOString(),
    };

    await this.auditService.logCrudEvent({
      tenantId,
      userId,
      action,
      entityType,
      entityId,
      changes,
      ipAddress: ip,
      userAgent,
    });
  }

  private resolveEntityType(url: string): EntityType {
    const segments = url.split('/').filter(Boolean);
    for (const segment of segments) {
      const clean = segment.split('?')[0].toLowerCase();
      if (clean === 'auditlog') return EntityType.AUDIT_LOG;
      const singular = clean.endsWith('s') ? clean.slice(0, -1) : clean;
      const enumKey = singular.toUpperCase();
      if (Object.values(EntityType).includes(enumKey as EntityType)) {
        return enumKey as EntityType;
      }
    }
    return EntityType.UNKNOWN;
  }

  private resolveEntityId(request: Request, responseBody: unknown): string {
    const body = responseBody as Record<string, unknown> | undefined;
    return (
      body?.id?.toString() ??
      (body?.data as Record<string, unknown>)?.id?.toString() ??
      request.params?.id?.toString() ??
      this.resolveEntityIdFromBody(request.body)
    );
  }

  private resolveEntityIdFromBody(body: unknown): string {
    if (!body || typeof body !== 'object') return 'unknown';

    const record = body as Record<string, unknown>;
    if (record.id) return record.id.toString();

    const compositeParts: string[] = [];
    for (const key of ['partida', 'ano', 'indice', 'userId', 'tenantId']) {
      if (record[key] !== undefined) compositeParts.push(`${key}:${record[key]}`);
    }
    if (compositeParts.length) return compositeParts.join('|');

    return 'unknown';
  }

  private extractAffected(body: unknown): unknown {
    if (!body) return null;
    const record = body as Record<string, unknown>;
    if (record.id) return { id: record.id };
    const data = record.data as Record<string, unknown> | undefined;
    if (data?.id) return { id: data.id };
    if (record.count) return { count: record.count };
    return null;
  }

  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') return body;

    const REDACTED_KEYS = new Set([
      'password',
      'passwordhash',
      'secret',
      'token',
      'accesstoken',
      'refreshtoken',
      'authorization',
      'apikey',
    ]);

    return Object.fromEntries(
      Object.entries(body as Record<string, unknown>).map(([k, v]) => [
        k,
        REDACTED_KEYS.has(k.toLowerCase()) ? '[REDACTED]' : v,
      ]),
    );
  }

  private getClientIp(request: Request): string {
    const forwarded = request.headers?.['x-forwarded-for'];
    if (forwarded) {
      return Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded.split(',')[0].trim();
    }
    return (
      (request.socket as any)?.remoteAddress ??
      (request as any).connection?.remoteAddress ??
      'unknown'
    );
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm --filter backend exec tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/shared/interceptors/audit-crud.interceptor.ts
git commit -m "feat(audit): refactor AuditCrudInterceptor with auto-detection"
```

---

### Task 8: Update AuditLog Repository

**Files:**
- Modify: `apps/backend/src/modules/auditLog/repositories/auditLog.repository.ts`

**Interfaces:**
- Consumes: PrismaService
- Produces: Repository methods with user includes

- [ ] **Step 1: Add user include to read methods**

Replace `apps/backend/src/modules/auditLog/repositories/auditLog.repository.ts`:

```typescript
// apps/backend/src/modules/auditLog/repositories/auditLog.repository.ts

import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  AuditActionType,
  AuditLog,
  EntityType,
} from '../../../generated/prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { BaseRepository } from '../../../shared/baseModule/base.repository';

const USER_INCLUDE = {
  user: {
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
    },
  },
};

@Injectable()
export class AuditLogRepository extends BaseRepository<AuditLog> {
  private readonly logger = new Logger(AuditLogRepository.name);

  constructor(prisma: PrismaService) {
    super(prisma, prisma.auditLog);
  }

  async findAll(): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
      include: USER_INCLUDE,
      orderBy: {
        timestamp: 'desc',
      },
    });
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
        deletedAt: null,
        isActive: true,
      },
      include: USER_INCLUDE,
      skip,
      take,
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  findAllByUserId(userId: string): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: {
        userId,
        deletedAt: null,
        isActive: true,
      },
      include: USER_INCLUDE,
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async createAuditLog(data: {
    tenantId: string;
    userId: string;
    action: AuditActionType;
    entityType: EntityType;
    entityId: string;
    changes: Record<string, unknown>;
  }): Promise<AuditLog> {
    try {
      const auditLog = await this.prisma.auditLog.create({
        data,
      });

      return auditLog;
    } catch (error) {
      this.logger.error('Error creating audit log:', error);
      throw new InternalServerErrorException('Error creating audit log');
    }
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm --filter backend exec tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/auditLog/repositories/auditLog.repository.ts
git commit -m "feat(audit): add user include to repository read methods"
```

---

### Task 9: Update AuditLog Service to Use AuditService

**Files:**
- Modify: `apps/backend/src/modules/auditLog/auditLog.service.ts`

**Interfaces:**
- Consumes: AuditService from Task 3
- Produces: Updated service delegating to AuditService

- [ ] **Step 1: Update service**

Replace `apps/backend/src/modules/auditLog/auditLog.service.ts`:

```typescript
// src/modules/auditLog/auditLog.service.ts

import { Injectable } from '@nestjs/common';
import { AuditService } from './audit.service';

@Injectable()
export class AuditLogService {
  constructor(private readonly auditService: AuditService) {}

  async getAllAuditLogs() {
    return this.auditService.findAll();
  }

  async getAllByTenantName(
    tenantName: string,
    page: number = 1,
    limit: number = 50,
  ) {
    return this.auditService.findAllByTenantName(tenantName, page, limit);
  }

  async getAllByUserId(userId: string) {
    return this.auditService.findAllByUserId(userId);
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm --filter backend exec tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/auditLog/auditLog.service.ts
git commit -m "refactor(audit): delegate to centralized AuditService"
```

---

### Task 10: Integrate Audit Events in AuthService

**Files:**
- Modify: `apps/backend/src/modules/auth/auth.service.ts`
- Modify: `apps/backend/src/modules/auth/auth.module.ts`

**Interfaces:**
- Consumes: AuditEventEmitter from Task 4, event DTOs from Task 2
- Produces: Auth events emitted on login/logout

- [ ] **Step 1: Update AuthModule**

Add AuditLogModule import to `apps/backend/src/modules/auth/auth.module.ts`:

```typescript
import { AuditLogModule } from '../auditLog/auditLog.module';

@Module({
  imports: [
    // ... existing imports
    AuditLogModule,
  ],
  // ... rest of module
})
export class AuthModule {}
```

- [ ] **Step 2: Update AuthService**

Add audit event emissions to `apps/backend/src/modules/auth/auth.service.ts`:

```typescript
import { AuditEventEmitter } from '../auditLog/events/audit-event.emitter';
import { AuditLoginEvent, AuditLogoutEvent } from '../auditLog/events/audit.events';

// In constructor, add:
constructor(
  // ... existing injections
  private readonly auditEventEmitter: AuditEventEmitter,
) {}

// In login method, after successful login:
async login(dto: LoginDto, ip: string, userAgent: string) {
  // ... existing login logic

  // After successful authentication:
  this.auditEventEmitter.emitLogin(
    new AuditLoginEvent(
      user.id,
      user.tenantId,
      ip,
      userAgent,
      true,
    ),
  );

  // ... return token
}

// In logout method:
async logout(userId: string, tenantId: string) {
  this.auditEventEmitter.emitLogout(
    new AuditLogoutEvent(userId, tenantId),
  );

  // ... existing logout logic
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `pnpm --filter backend exec tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/modules/auth/auth.service.ts apps/backend/src/modules/auth/auth.module.ts
git commit -m "feat(audit): integrate audit events in AuthService"
```

---

### Task 11: Update Frontend AuditLog Service

**Files:**
- Modify: `apps/frontend/src/features/auditLogs/api/auditLogService.ts`

**Interfaces:**
- Consumes: AuditLogDto from shared
- Produces: Updated service with proper typing

- [ ] **Step 1: Update service**

Replace `apps/frontend/src/features/auditLogs/api/auditLogService.ts`:

```typescript
// apps/frontend/src/features/auditLogs/api/auditLogService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { AuditLogDto } from "@vivero/shared";

export const auditLogService = {
  fetchAll: () => {
    return clientFetch<AuditLogDto[]>("auditLog", {
      method: "GET",
    });
  },

  fetchByTenantName: (tenantName: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());
    const queryString = params.toString();
    return clientFetch<AuditLogDto[]>(
      `auditLog/${tenantName}${queryString ? `?${queryString}` : ""}`,
      { method: "GET" },
    );
  },

  fetchByUserId: (userId: string) => {
    return clientFetch<AuditLogDto[]>(`auditLog/user/${userId}`, {
      method: "GET",
    });
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/features/auditLogs/api/auditLogService.ts
git commit -m "feat(audit): update frontend auditLog service with pagination"
```

---

### Task 12: Update Frontend Columns for New Event Types

**Files:**
- Modify: `apps/frontend/src/features/auditLogs/components/columns.tsx`

**Interfaces:**
- Consumes: AuditLogDto
- Produces: Updated columns handling new event types

- [ ] **Step 1: Update action icons**

Add new action types to `apps/frontend/src/features/auditLogs/components/columns.tsx`:

```typescript
// In getActionIcon function, add cases:
const getActionIcon = (action: string) => {
  switch (action) {
    case "CREATE":
      return <Plus className="h-4 w-4 text-primary" />;
    case "UPDATE":
      return <Pencil className="h-4 w-4 text-secondary" />;
    case "DELETE":
      return <Trash2 className="h-4 w-4 text-destructive" />;
    case "LOGIN":
      return <LogIn className="h-4 w-4 text-green-500" />;
    case "LOGOUT":
      return <LogOut className="h-4 w-4 text-muted-foreground" />;
    case "LOGIN_FAILED":
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case "PASSWORD_CHANGE":
      return <Key className="h-4 w-4 text-blue-500" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />;
  }
};

// In variantMap, add new variants:
const variantMap: Record<
  string,
  "default" | "destructive" | "secondary" | "outline"
> = {
  CREATE: "default",
  UPDATE: "secondary",
  DELETE: "destructive",
  LOGIN: "default",
  LOGOUT: "outline",
  LOGIN_FAILED: "destructive",
  PASSWORD_CHANGE: "secondary",
};
```

- [ ] **Step 2: Add missing imports**

Add to imports in `columns.tsx`:

```typescript
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  Globe,
  Smartphone,
  User,
  LogIn,
  LogOut,
  AlertTriangle,
  Key,
} from "lucide-react";
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/auditLogs/components/columns.tsx
git commit -m "feat(audit): add auth event types to frontend columns"
```

---

### Task 13: Update Frontend AuditLog Form

**Files:**
- Modify: `apps/frontend/src/features/auditLogs/components/auditLog-form.tsx`

**Interfaces:**
- Consumes: AuditLogDto
- Produces: Updated form handling auth events

- [ ] **Step 1: Update form to handle auth events**

Add action badge styling for auth events in `auditLog-form.tsx`:

```typescript
// Add action badge colors for auth events
const getActionBadge = (action: string) => {
  const colors: Record<string, string> = {
    CREATE: "bg-green-100 text-green-800",
    UPDATE: "bg-blue-100 text-blue-800",
    DELETE: "bg-red-100 text-red-800",
    LOGIN: "bg-green-100 text-green-800",
    LOGOUT: "bg-gray-100 text-gray-800",
    LOGIN_FAILED: "bg-orange-100 text-orange-800",
    PASSWORD_CHANGE: "bg-blue-100 text-blue-800",
  };
  return colors[action] || "bg-gray-100 text-gray-800";
};
```

- [ ] **Step 2: Update changes display**

Add helper to format auth event changes:

```typescript
const formatChangesForDisplay = (changes: Record<string, unknown> | null) => {
  if (!changes || Object.keys(changes).length === 0) return null;
  
  // Filter out metadata fields for cleaner display
  const metadataFields = ['requestId', 'endpoint', 'method', 'durationMs', 'timestamp'];
  const displayFields = Object.entries(changes).filter(
    ([key]) => !metadataFields.includes(key)
  );
  
  return displayFields.length > 0 ? Object.fromEntries(displayFields) : null;
};
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/auditLogs/components/auditLog-form.tsx
git commit -m "feat(audit): update frontend form for auth events"
```

---

### Task 14: Run Verification

**Files:**
- None (verification only)

- [ ] **Step 1: Run lint**

Run: `pnpm lint`
Expected: No errors

- [ ] **Step 2: Run type check**

Run: `pnpm type-check`
Expected: No errors

- [ ] **Step 3: Run tests**

Run: `pnpm test`
Expected: All tests pass

- [ ] **Step 4: Run audit**

Run: `pnpm audit --audit-level high`
Expected: No high vulnerabilities

- [ ] **Step 5: Start dev server and test manually**

Run: `pnpm dev:backend`
Expected: Server starts without errors

- [ ] **Step 6: Final commit if all passes**

```bash
git add -A
git commit -m "chore(audit): verify all changes pass lint, typecheck, and tests"
```
