# Billboard / In-App Announcements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a database-backed billboard system for displaying permission-targeted, tag-grouped update announcements to users via a dismissible modal at login.

**Architecture:** Standalone NestJS module (`billboard/`) with BillboardMessage + UserBillboardRead Prisma models. Backend filters messages by user permissions, tag-deduplicates, and excludes read messages. Frontend renders a full-screen modal triggered after dashboard layout mounts, with "Entendido" to mark read or dismiss-with-warning via AlertDialog.

**Tech Stack:** Prisma 7 (multi-file schema), NestJS 11, Next.js 16 (App Router), shadcn/ui Dialog + AlertDialog, React Query (useSuspenseQuery), Zod schemas via `@vivero/shared`.

## Global Constraints

- Prisma schema in `apps/backend/prisma/schema/` (multi-file, auto-loaded)
- All shared types/schemas in `packages/shared/src/schemas/` via `@vivero/shared`
- Conventional Commits enforced (`feat`, `fix`, `test`, etc.)
- TDD: tests before or alongside feature code
- Spanish validation messages and UI copy
- No `passwordHash` leaks in API responses
- Backend port via `PORT` env var (default 3001)
- `@RequirePermission` decorator required on all non-public routes (PermissionsGuard denies by default)
- Frontend uses `clientFetch` from `@/lib/api/client-fetch`
- Query keys centralized in `@/lib/queryKeys`
- Mutation invalidation via `invalidateQueries()` from `@/lib/query-invalidation-map`

---

## File Map

### Create

| File | Purpose |
|------|---------|
| `apps/backend/prisma/schema/billboard.prisma` | BillboardMessage + UserBillboardRead models |
| `packages/shared/src/schemas/billboard.schema.ts` | Zod schemas + types |
| `apps/backend/src/modules/billboard/billboard.module.ts` | NestJS module |
| `apps/backend/src/modules/billboard/billboard.controller.ts` | REST endpoints |
| `apps/backend/src/modules/billboard/billboard.service.ts` | Business logic |
| `apps/backend/src/modules/billboard/repositories/billboard.repository.ts` | Data access |
| `apps/backend/src/modules/billboard/__tests__/billboard.service.spec.ts` | Unit tests |
| `apps/frontend/src/features/billboard/types.ts` | TypeScript types |
| `apps/frontend/src/features/billboard/api/billboardService.ts` | API client |
| `apps/frontend/src/features/billboard/hooks/useUnreadBillboard.ts` | Query hook |
| `apps/frontend/src/features/billboard/hooks/useMarkBillboardRead.ts` | Mutation hook |
| `apps/frontend/src/features/billboard/components/BillboardModal.tsx` | Modal UI |
| `apps/frontend/src/features/billboard/index.ts` | Barrel exports |

### Modify

| File | Change |
|------|--------|
| `apps/backend/prisma/schema/user.prisma` | Add `billboardReads UserBillboardRead[]` relation |
| `packages/shared/src/index.ts` | Add `export * from "./schemas/billboard.schema"` |
| `apps/backend/src/app.module.ts` | Register `BillboardModule` |
| `apps/frontend/src/lib/queryKeys.ts` | Add `billboardQueryKeys` |
| `apps/frontend/src/lib/query-invalidation-map.ts` | Add `markBillboardRead` mutation entry |
| `apps/frontend/src/app/(dashboard)/layout.tsx` | Add `<BillboardCheck />` component |

---

### Task 1: Prisma Schema — BillboardMessage + UserBillboardRead

**Files:**
- Create: `apps/backend/prisma/schema/billboard.prisma`
- Modify: `apps/backend/prisma/schema/user.prisma`

**Interfaces:**
- Produces: `BillboardMessage` and `UserBillboardRead` models used by repository (Task 3)

- [ ] **Step 1: Create billboard.prisma**

```prisma
// prisma/schema/billboard.prisma

model BillboardMessage {
  id              String    @id @default(cuid())
  title           String    @db.VarChar(200)
  body            String    @db.VarChar(500)
  tag             String    @db.VarChar(50)
  permissionTable String    @db.VarChar(50)
  permissionAction String   @db.VarChar(20)
  permissionScope String    @db.VarChar(10)
  targetNewUsers  Boolean   @default(false)
  effectiveFrom   DateTime?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedByUserId String?
  deletedAt       DateTime? @db.Timestamp(0)

  reads           UserBillboardRead[]

  @@index([tag])
  @@index([isActive, deletedAt])
  @@index([deletedByUserId])
  @@map("billboard_messages")
}

model UserBillboardRead {
  id                 String           @id @default(cuid())
  userId             String
  billboardMessageId String
  readAt             DateTime         @default(now())

  user               User             @relation(fields: [userId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  billboardMessage   BillboardMessage @relation(fields: [billboardMessageId], references: [id], onDelete: NoAction, onUpdate: NoAction)

  @@unique([userId, billboardMessageId])
  @@index([userId])
  @@index([billboardMessageId])
  @@map("user_billboard_reads")
}
```

- [ ] **Step 2: Add relation to user.prisma**

Add after `SiembraPartidas SiembraPartidas[]`:

```diff
  SiembraPartidas SiembraPartidas[]
+ billboardReads UserBillboardRead[]
```

Also add soft-delete relation after `deletedSiembraPartidas`:

```diff
  deletedSiembraPartidas SiembraPartidas[] @relation("deleted_siembra_partdas")
+ deletedBillboardMessages BillboardMessage[] @relation("deleted_billboard_messages")
```

- [ ] **Step 3: Verify Prisma generate works**

Run: `cd apps/backend && pnpm prisma generate`
Expected: Client generated successfully

- [ ] **Step 4: Commit**

```bash
git add apps/backend/prisma/schema/billboard.prisma apps/backend/prisma/schema/user.prisma
git commit -m "feat(billboard): add BillboardMessage and UserBillboardRead Prisma models"
```

---

### Task 2: Shared Zod Schemas

**Files:**
- Create: `packages/shared/src/schemas/billboard.schema.ts`
- Modify: `packages/shared/src/index.ts`

**Interfaces:**
- Produces: `BillboardMessageDto`, `MarkBillboardReadDto` types used by controller (Task 5) and frontend (Task 7)

- [ ] **Step 1: Create billboard.schema.ts**

```typescript
// packages/shared/src/schemas/billboard.schema.ts

import { z } from "zod";
import { cuidSchema } from "./cuid.schema";

// ============================================================================
// BILLBOARD MESSAGE (read DTO — what the API returns to the user)
// ============================================================================

export const BillboardMessageSchema = z.object({
  id: cuidSchema,
  title: z.string(),
  body: z.string(),
  tag: z.string(),
  createdAt: z.string(),
});

export type BillboardMessageDto = z.infer<typeof BillboardMessageSchema>;

// ============================================================================
// MARK BILLBOARD READ (request body)
// ============================================================================

export const MarkBillboardReadSchema = z.object({
  messageIds: z.array(cuidSchema).optional(),
});

export type MarkBillboardReadDto = z.infer<typeof MarkBillboardReadSchema>;
```

- [ ] **Step 2: Add export to shared index**

Add to `packages/shared/src/index.ts` after the last schema export:

```diff
+ export * from "./schemas/billboard.schema";
```

- [ ] **Step 3: Build shared package**

Run: `pnpm --filter @vivero/shared build`
Expected: Builds without errors

- [ ] **Step 4: Commit**

```bash
git add packages/shared/src/schemas/billboard.schema.ts packages/shared/src/index.ts
git commit -m "feat(shared): add billboard Zod schemas and types"
```

---

### Task 3: Billboard Repository

**Files:**
- Create: `apps/backend/src/modules/billboard/repositories/billboard.repository.ts`

**Interfaces:**
- Consumes: PrismaService, BillboardMessage model from Task 1
- Produces: `findUnreadForUser()`, `markAsRead()`, `countUnreadForUser()` methods used by service (Task 4)

- [ ] **Step 1: Create billboard.repository.ts**

```typescript
// src/modules/billboard/repositories/billboard.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { BaseRepository, SoftDeletableModel } from '../../../shared/baseModule/base.repository';
import { BillboardMessage } from '../../../generated/prisma/client';

type BillboardMessageWithReads = BillboardMessage & {
  reads: { id: string }[];
};

export interface UnreadMessageRow {
  id: string;
  title: string;
  body: string;
  tag: string;
  createdAt: Date;
}

@Injectable()
export class BillboardRepository extends BaseRepository<BillboardMessage> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.billboardMessage);
  }

  /**
   * Find all active, non-deleted billboard messages.
   */
  async findAllActive(): Promise<BillboardMessage[]> {
    return this.prisma.billboardMessage.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find read message IDs for a user.
   */
  async findReadIds(userId: string): Promise<Set<string>> {
    const reads = await this.prisma.userBillboardRead.findMany({
      where: { userId },
      select: { billboardMessageId: true },
    });
    return new Set(reads.map((r) => r.billboardMessageId));
  }

  /**
   * Mark messages as read for a user (bulk upsert).
   */
  async markAsRead(userId: string, messageIds: string[]): Promise<number> {
    if (messageIds.length === 0) return 0;

    const result = await this.prisma.userBillboardRead.createMany({
      data: messageIds.map((billboardMessageId) => ({
        userId,
        billboardMessageId,
      })),
      skipDuplicates: true,
    });

    return result.count;
  }

  /**
   * Count unread messages for a user (lightweight check).
   */
  async countUnreadForUser(userId: string): Promise<number> {
    const allMessages = await this.findAllActive();
    const readIds = await this.findReadIds(userId);

    let count = 0;
    for (const msg of allMessages) {
      if (!readIds.has(msg.id)) {
        count++;
      }
    }
    return count;
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/backend && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to billboard.repository.ts

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/billboard/repositories/billboard.repository.ts
git commit -m "feat(billboard): add BillboardRepository with unread query and mark-as-read"
```

---

### Task 4: Billboard Service

**Files:**
- Create: `apps/backend/src/modules/billboard/billboard.service.ts`

**Interfaces:**
- Consumes: BillboardRepository (Task 3), PermissionsService (existing), UsersRepository (existing)
- Produces: `getUnreadMessages()`, `markAsRead()` methods used by controller (Task 5)

- [ ] **Step 1: Create billboard.service.ts**

```typescript
// src/modules/billboard/billboard.service.ts

import { Injectable } from '@nestjs/common';
import { BillboardRepository } from './repositories/billboard.repository';
import { PermissionsService } from '../permissions/permissions.service';
import { UsersRepository } from '../users/repositories/users.repository';
import { BillboardMessageDto } from '@vivero/shared';

type ActionKey = 'canCreate' | 'canRead' | 'canUpdate' | 'canDelete';

const SCOPE_ORDER: Record<string, number> = {
  NONE: 0,
  OWN: 1,
  ALL: 2,
};

@Injectable()
export class BillboardService {
  constructor(
    private readonly billboardRepo: BillboardRepository,
    private readonly permissionsService: PermissionsService,
    private readonly usersRepo: UsersRepository,
  ) {}

  /**
   * Get unread billboard messages for a user, filtered by:
   * - Permission match (entity + action + scope)
   * - Tag deduplication (latest per tag only)
   * - effectiveFrom (user.createdAt >= message.effectiveFrom)
   * - targetNewUsers (message.targetNewUsers OR user.createdAt < message.createdAt)
   * - Excludes already-read messages
   */
  async getUnreadMessages(userId: string): Promise<BillboardMessageDto[]> {
    const [allMessages, readIds, userPerms, user] = await Promise.all([
      this.billboardRepo.findAllActive(),
      this.billboardRepo.findReadIds(userId),
      this.permissionsService.getUserPermissionsByUserId(userId),
      this.usersRepo.findById(userId, userId),
    ]);

    if (!user) return [];

    // 1. Filter by permission match
    const permissionFiltered = allMessages.filter((msg) => {
      const tablePerm = userPerms[msg.permissionTable];
      if (!tablePerm) return false;

      // Check action
      const actionKey = `can${msg.permissionAction.charAt(0).toUpperCase()}${msg.permissionAction.slice(1)}` as ActionKey;
      if (!tablePerm[actionKey]) return false;

      // Check scope: user scope must be >= message required scope
      const userScopeLevel = SCOPE_ORDER[tablePerm.scope] ?? 0;
      const requiredScopeLevel = SCOPE_ORDER[msg.permissionScope] ?? 0;
      if (userScopeLevel < requiredScopeLevel) return false;

      return true;
    });

    // 2. Filter by effectiveFrom
    const effectiveFiltered = permissionFiltered.filter((msg) => {
      if (msg.effectiveFrom && user.createdAt < msg.effectiveFrom) return false;
      return true;
    });

    // 3. Filter by targetNewUsers
    const targetFiltered = effectiveFiltered.filter((msg) => {
      if (!msg.targetNewUsers && user.createdAt > msg.createdAt) return false;
      return true;
    });

    // 4. Group by tag, keep only latest per tag
    const tagMap = new Map<string, typeof targetFiltered[0]>();
    for (const msg of targetFiltered) {
      const existing = tagMap.get(msg.tag);
      if (!existing || msg.createdAt > existing.createdAt) {
        tagMap.set(msg.tag, msg);
      }
    }

    // 5. Exclude already-read messages
    const unread = Array.from(tagMap.values()).filter(
      (msg) => !readIds.has(msg.id),
    );

    // 6. Sort by createdAt DESC
    unread.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // 7. Map to DTO
    return unread.map((msg) => ({
      id: msg.id,
      title: msg.title,
      body: msg.body,
      tag: msg.tag,
      createdAt: msg.createdAt.toISOString(),
    }));
  }

  /**
   * Mark messages as read. If messageIds not provided, mark all currently unread.
   */
  async markAsRead(userId: string, messageIds?: string[]): Promise<number> {
    let idsToMark = messageIds;

    if (!idsToMark || idsToMark.length === 0) {
      // Mark all currently unread
      const unread = await this.getUnreadMessages(userId);
      idsToMark = unread.map((m) => m.id);
    }

    return this.billboardRepo.markAsRead(userId, idsToMark);
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/backend && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to billboard.service.ts

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/billboard/billboard.service.ts
git commit -m "feat(billboard): add BillboardService with permission filtering and tag dedup"
```

---

### Task 5: Billboard Controller

**Files:**
- Create: `apps/backend/src/modules/billboard/billboard.controller.ts`

**Interfaces:**
- Consumes: BillboardService (Task 4), ZodValidationPipe, RequirePermission, CurrentUser decorators
- Produces: `GET /billboard/unread`, `POST /billboard/read` endpoints

- [ ] **Step 1: Create billboard.controller.ts**

```typescript
// src/modules/billboard/billboard.controller.ts

import { Body, Controller, Get, Post } from '@nestjs/common';
import { BillboardService } from './billboard.service';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation-pipe';
import { BillboardMessageDto, MarkBillboardReadSchema, MarkBillboardReadDto } from '@vivero/shared';

@Controller('billboard')
export class BillboardController {
  constructor(private readonly service: BillboardService) {}

  @Get('unread')
  @RequirePermission({ tableName: 'user_profile', action: 'read', scope: 'OWN' })
  async getUnread(
    @CurrentUser() user: AuthUser,
  ): Promise<BillboardMessageDto[]> {
    return this.service.getUnreadMessages(user.id);
  }

  @Post('read')
  @RequirePermission({ tableName: 'user_profile', action: 'read', scope: 'OWN' })
  async markAsRead(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(MarkBillboardReadSchema))
    data: MarkBillboardReadDto,
  ): Promise<{ markedCount: number }> {
    const markedCount = await this.service.markAsRead(user.id, data.messageIds);
    return { markedCount };
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/backend && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to billboard.controller.ts

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/billboard/billboard.controller.ts
git commit -m "feat(billboard): add BillboardController with unread and read endpoints"
```

---

### Task 6: Billboard Module + Register in AppModule

**Files:**
- Create: `apps/backend/src/modules/billboard/billboard.module.ts`
- Modify: `apps/backend/src/app.module.ts`

**Interfaces:**
- Consumes: BillboardController (Task 5), BillboardService (Task 4), BillboardRepository (Task 3)
- Produces: Registered NestJS module

- [ ] **Step 1: Create billboard.module.ts**

```typescript
// src/modules/billboard/billboard.module.ts

import { Module } from '@nestjs/common';
import { BillboardController } from './billboard.controller';
import { BillboardService } from './billboard.service';
import { BillboardRepository } from './repositories/billboard.repository';
import { PermissionsModule } from '../permissions/permissions.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PermissionsModule, UsersModule],
  controllers: [BillboardController],
  providers: [BillboardService, BillboardRepository],
  exports: [BillboardService],
})
export class BillboardModule {}
```

- [ ] **Step 2: Register in app.module.ts**

Add import at the top of `apps/backend/src/app.module.ts`:

```diff
+ import { BillboardModule } from './modules/billboard/billboard.module';
```

Add to the `imports` array (after `SustratosModule`):

```diff
  SustratosModule,
+ BillboardModule,
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd apps/backend && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/modules/billboard/billboard.module.ts apps/backend/src/app.module.ts
git commit -m "feat(billboard): register BillboardModule in AppModule"
```

---

### Task 7: Billboard Unit Tests

**Files:**
- Create: `apps/backend/src/modules/billboard/__tests__/billboard.service.spec.ts`

**Interfaces:**
- Consumes: BillboardService (Task 4)
- Produces: Passing unit tests

- [ ] **Step 1: Create billboard.service.spec.ts**

```typescript
// src/modules/billboard/__tests__/billboard.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { BillboardService } from '../billboard.service';
import { BillboardRepository } from '../repositories/billboard.repository';
import { PermissionsService } from '../../permissions/permissions.service';
import { UsersRepository } from '../../users/repositories/users.repository';

describe('BillboardService', () => {
  let service: BillboardService;
  let billboardRepo: jest.Mocked<BillboardRepository>;
  let permissionsService: jest.Mocked<PermissionsService>;
  let usersRepo: jest.Mocked<UsersRepository>;

  const mockUser = {
    id: 'user-1',
    username: 'testuser',
    tenantId: 'tenant-1',
    createdAt: new Date('2025-01-01'),
  };

  const mockMessages = [
    {
      id: 'msg-1',
      title: 'Alerts Update',
      body: 'Alerts solved now covers all alerts',
      tag: 'alerts-solved',
      permissionTable: 'alerts',
      permissionAction: 'update',
      permissionScope: 'ALL',
      targetNewUsers: true,
      effectiveFrom: null,
      isActive: true,
      createdAt: new Date('2025-06-01'),
      updatedAt: new Date('2025-06-01'),
      deletedAt: null,
      deletedByUserId: null,
    },
    {
      id: 'msg-2',
      title: 'Old Alerts Update',
      body: 'Previous alerts message',
      tag: 'alerts-solved',
      permissionTable: 'alerts',
      permissionAction: 'update',
      permissionScope: 'ALL',
      targetNewUsers: false,
      effectiveFrom: null,
      isActive: true,
      createdAt: new Date('2025-05-01'),
      updatedAt: new Date('2025-05-01'),
      deletedAt: null,
      deletedByUserId: null,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillboardService,
        {
          provide: BillboardRepository,
          useValue: {
            findAllActive: jest.fn(),
            findReadIds: jest.fn(),
            markAsRead: jest.fn(),
          },
        },
        {
          provide: PermissionsService,
          useValue: {
            getUserPermissionsByUserId: jest.fn(),
          },
        },
        {
          provide: UsersRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BillboardService>(BillboardService);
    billboardRepo = module.get(BillboardRepository);
    permissionsService = module.get(PermissionsService);
    usersRepo = module.get(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUnreadMessages', () => {
    it('returns messages filtered by user permissions', async () => {
      billboardRepo.findAllActive.mockResolvedValue(mockMessages as any);
      billboardRepo.findReadIds.mockResolvedValue(new Set());
      permissionsService.getUserPermissionsByUserId.mockResolvedValue({
        alerts: {
          canCreate: false,
          canRead: true,
          canUpdate: true,
          canDelete: false,
          scope: 'ALL',
          permissionType: 'CRUD',
        },
      });
      usersRepo.findById.mockResolvedValue(mockUser as any);

      const result = await service.getUnreadMessages('user-1');

      // Only msg-1 should be returned (msg-2 is same tag, older = superseded)
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('msg-1');
    });

    it('excludes messages user has no permission for', async () => {
      billboardRepo.findAllActive.mockResolvedValue(mockMessages as any);
      billboardRepo.findReadIds.mockResolvedValue(new Set());
      permissionsService.getUserPermissionsByUserId.mockResolvedValue({});
      usersRepo.findById.mockResolvedValue(mockUser as any);

      const result = await service.getUnreadMessages('user-1');
      expect(result).toHaveLength(0);
    });

    it('excludes already-read messages', async () => {
      billboardRepo.findAllActive.mockResolvedValue(mockMessages as any);
      billboardRepo.findReadIds.mockResolvedValue(new Set(['msg-1']));
      permissionsService.getUserPermissionsByUserId.mockResolvedValue({
        alerts: {
          canCreate: false,
          canRead: true,
          canUpdate: true,
          canDelete: false,
          scope: 'ALL',
          permissionType: 'CRUD',
        },
      });
      usersRepo.findById.mockResolvedValue(mockUser as any);

      const result = await service.getUnreadMessages('user-1');
      expect(result).toHaveLength(0);
    });

    it('keeps only latest message per tag', async () => {
      billboardRepo.findAllActive.mockResolvedValue(mockMessages as any);
      billboardRepo.findReadIds.mockResolvedValue(new Set());
      permissionsService.getUserPermissionsByUserId.mockResolvedValue({
        alerts: {
          canCreate: false,
          canRead: true,
          canUpdate: true,
          canDelete: false,
          scope: 'ALL',
          permissionType: 'CRUD',
        },
      });
      usersRepo.findById.mockResolvedValue(mockUser as any);

      const result = await service.getUnreadMessages('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('msg-1'); // newer one
    });

    it('respects scope hierarchy', async () => {
      const msgWithAllScope = { ...mockMessages[0], permissionScope: 'ALL' };
      billboardRepo.findAllActive.mockResolvedValue([msgWithAllScope] as any);
      billboardRepo.findReadIds.mockResolvedValue(new Set());
      permissionsService.getUserPermissionsByUserId.mockResolvedValue({
        alerts: {
          canCreate: false,
          canRead: true,
          canUpdate: true,
          canDelete: false,
          scope: 'OWN', // user has OWN, message requires ALL
          permissionType: 'CRUD',
        },
      });
      usersRepo.findById.mockResolvedValue(mockUser as any);

      const result = await service.getUnreadMessages('user-1');
      expect(result).toHaveLength(0);
    });

    it('returns empty array if user not found', async () => {
      billboardRepo.findAllActive.mockResolvedValue([]);
      billboardRepo.findReadIds.mockResolvedValue(new Set());
      permissionsService.getUserPermissionsByUserId.mockResolvedValue({});
      usersRepo.findById.mockResolvedValue(null);

      const result = await service.getUnreadMessages('user-1');
      expect(result).toHaveLength(0);
    });
  });

  describe('markAsRead', () => {
    it('marks specific messages as read', async () => {
      billboardRepo.markAsRead.mockResolvedValue(2);

      const count = await service.markAsRead('user-1', ['msg-1', 'msg-2']);
      expect(count).toBe(2);
      expect(billboardRepo.markAsRead).toHaveBeenCalledWith('user-1', [
        'msg-1',
        'msg-2',
      ]);
    });

    it('marks all unread messages when no IDs provided', async () => {
      billboardRepo.findAllActive.mockResolvedValue(mockMessages as any);
      billboardRepo.findReadIds.mockResolvedValue(new Set());
      permissionsService.getUserPermissionsByUserId.mockResolvedValue({
        alerts: {
          canCreate: false,
          canRead: true,
          canUpdate: true,
          canDelete: false,
          scope: 'ALL',
          permissionType: 'CRUD',
        },
      });
      usersRepo.findById.mockResolvedValue(mockUser as any);
      billboardRepo.markAsRead.mockResolvedValue(1);

      const count = await service.markAsRead('user-1');
      expect(count).toBe(1);
      expect(billboardRepo.markAsRead).toHaveBeenCalledWith('user-1', [
        'msg-1',
      ]);
    });
  });
});
```

- [ ] **Step 2: Run tests**

Run: `cd apps/backend && pnpm jest --testPathPattern=billboard.service.spec.ts --verbose`
Expected: All 8 tests pass

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/billboard/__tests__/billboard.service.spec.ts
git commit -m "test(billboard): add BillboardService unit tests"
```

---

### Task 8: Frontend — Types, API Service, Query Keys

**Files:**
- Create: `apps/frontend/src/features/billboard/types.ts`
- Create: `apps/frontend/src/features/billboard/api/billboardService.ts`
- Modify: `apps/frontend/src/lib/queryKeys.ts`

**Interfaces:**
- Consumes: `BillboardMessageDto` from `@vivero/shared`
- Produces: `billboardService`, `billboardQueryKeys` used by hooks (Task 9)

- [ ] **Step 1: Create types.ts**

```typescript
// src/features/billboard/types.ts

import type { BillboardMessageDto } from "@vivero/shared";

export type { BillboardMessageDto };
```

- [ ] **Step 2: Create billboardService.ts**

```typescript
// src/features/billboard/api/billboardService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import type { BillboardMessageDto, MarkBillboardReadDto } from "@vivero/shared";

export const billboardService = {
  fetchUnread: () => {
    return clientFetch<BillboardMessageDto[]>("billboard/unread", {
      method: "GET",
    });
  },

  markAsRead: (data: MarkBillboardReadDto = {}) => {
    return clientFetch<{ markedCount: number }>("billboard/read", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
```

- [ ] **Step 3: Add query keys to queryKeys.ts**

Add after `alertsSolvedQueryKeys`:

```typescript
// ============================================================================
// BILLBOARD
// ============================================================================

export const billboardQueryKeys = {
  all: () => ["billboard"] as const,
  unread: () => [...billboardQueryKeys.all(), "unread"] as const,
};
```

- [ ] **Step 4: Add invalidation entry to query-invalidation-map.ts**

Add import at the top:

```diff
+ import { billboardQueryKeys } from "./queryKeys";
```

Add to `mutationInvalidationMap`:

```typescript
  markBillboardRead: {
    queries: () => [billboardQueryKeys.unread()],
  },
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `cd apps/frontend && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/features/billboard/types.ts apps/frontend/src/features/billboard/api/billboardService.ts apps/frontend/src/lib/queryKeys.ts apps/frontend/src/lib/query-invalidation-map.ts
git commit -m "feat(billboard): add frontend API service and query keys"
```

---

### Task 9: Frontend — React Query Hooks

**Files:**
- Create: `apps/frontend/src/features/billboard/hooks/useUnreadBillboard.ts`
- Create: `apps/frontend/src/features/billboard/hooks/useMarkBillboardRead.ts`

**Interfaces:**
- Consumes: `billboardService` (Task 8), `billboardQueryKeys` (Task 8)
- Produces: `useUnreadBillboard`, `useMarkBillboardRead` hooks used by modal (Task 10)

- [ ] **Step 1: Create useUnreadBillboard.ts**

```typescript
// src/features/billboard/hooks/useUnreadBillboard.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import type { BillboardMessageDto } from "@vivero/shared";
import { billboardService } from "../api/billboardService";
import { billboardQueryKeys } from "@/lib/queryKeys";

export const useUnreadBillboard = () => {
  return useQuery<BillboardMessageDto[]>({
    queryKey: billboardQueryKeys.unread(),
    queryFn: billboardService.fetchUnread,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes — don't refetch aggressively
  });
};
```

Note: Using `useQuery` (not `useSuspenseQuery`) so the query fails silently and doesn't block the dashboard. If it errors, the modal simply doesn't show.

- [ ] **Step 2: Create useMarkBillboardRead.ts**

```typescript
// src/features/billboard/hooks/useMarkBillboardRead.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { billboardService } from "../api/billboardService";
import { billboardQueryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

export const useMarkBillboardRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: billboardService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: billboardQueryKeys.unread(),
      });
      toast.success("¡Actualizaciones revisadas!");
    },
    onError: () => {
      toast.error("No se pudo marcar como leído. Intenta de nuevo.");
    },
  });
};
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd apps/frontend && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/features/billboard/hooks/
git commit -m "feat(billboard): add useUnreadBillboard and useMarkBillboardRead hooks"
```

---

### Task 10: BillboardModal Component

**Files:**
- Create: `apps/frontend/src/features/billboard/components/BillboardModal.tsx`

**Interfaces:**
- Consumes: `useMarkBillboardRead` (Task 9), `BillboardMessageDto` type, shadcn Dialog + AlertDialog
- Produces: `<BillboardModal>` component used by layout (Task 11)

- [ ] **Step 1: Create BillboardModal.tsx**

```tsx
// src/features/billboard/components/BillboardModal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useMarkBillboardRead } from "../hooks/useMarkBillboardRead";
import type { BillboardMessageDto } from "@vivero/shared";

interface BillboardModalProps {
  open: boolean;
  messages: BillboardMessageDto[];
  onClose: () => void;
}

export function BillboardModal({
  open,
  messages,
  onClose,
}: BillboardModalProps) {
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const markAsRead = useMarkBillboardRead();

  const handleConfirmRead = () => {
    markAsRead.mutate(undefined, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleCloseAttempt = () => {
    setShowConfirmClose(true);
  };

  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCloseAttempt()}>
        <DialogContent className="max-h-[90vh] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Actualizaciones</DialogTitle>
            <DialogDescription>
              Hay {messages.length} {messages.length === 1 ? "novedad" : "novedades"} para ti.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="rounded-lg border bg-card p-4 space-y-2"
              >
                <h3 className="font-semibold text-sm">{msg.title}</h3>
                <p className="text-sm text-muted-foreground">{msg.body}</p>
                <time className="text-xs text-muted-foreground">
                  {new Date(msg.createdAt).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              onClick={handleConfirmRead}
              disabled={markAsRead.isPending}
            >
              {markAsRead.isPending ? "Marcando..." : "Entendido"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sin marcar como leído?</AlertDialogTitle>
            <AlertDialogDescription>
              Los mensajes no se marcarán como leídos. Los verás en tu próximo
              inicio de sesión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Cerrar de todos modos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/frontend && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/features/billboard/components/BillboardModal.tsx
git commit -m "feat(billboard): add BillboardModal with dismiss confirmation"
```

---

### Task 11: Frontend — Barrel Export + Layout Integration

**Files:**
- Create: `apps/frontend/src/features/billboard/index.ts`
- Modify: `apps/frontend/src/app/(dashboard)/layout.tsx`

**Interfaces:**
- Consumes: `BillboardModal` (Task 10), `useUnreadBillboard` (Task 9)
- Produces: Billboard integrated into dashboard layout

- [ ] **Step 1: Create index.ts barrel export**

```typescript
// src/features/billboard/index.ts

export { BillboardModal } from "./components/BillboardModal";
export { useUnreadBillboard } from "./hooks/useUnreadBillboard";
export { useMarkBillboardRead } from "./hooks/useMarkBillboardRead";
```

- [ ] **Step 2: Add BillboardCheck to dashboard layout**

Modify `apps/frontend/src/app/(dashboard)/layout.tsx`:

```tsx
//src/app/(dashboard)/layout.tsx

import type React from "react";

import { DesktopSidebar } from "@/components/layout/desktop-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

import { DashboardProtectedLayout } from "@/components/common/dashboard-protected-layout";
import { BillboardCheck } from "@/components/common/billboard-check";

export const dynamic = "force-dynamic";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <DashboardProtectedLayout>
      <div className="flex h-dvh overflow-hidden">
        <DesktopSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <BillboardCheck />
          <main className="flex-1 overflow-auto pb-safe-area-inset-bottom md:pb-0 px-1 sm:px-2 lg:px-4 py-1.5">
            <div className="mx-auto w-full max-w-[1600px] space-y-4 pb-1 mb-0.5">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardProtectedLayout>
  );
}
```

- [ ] **Step 3: Create BillboardCheck client component**

Create `apps/frontend/src/components/common/billboard-check.tsx`:

```tsx
// src/components/common/billboard-check.tsx
"use client";

import { useState, useEffect } from "react";
import { useUnreadBillboard } from "@/features/billboard/hooks/useUnreadBillboard";
import { BillboardModal } from "@/features/billboard/components/BillboardModal";

export function BillboardCheck() {
  const { data: messages } = useUnreadBillboard();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (messages && messages.length > 0) {
      setOpen(true);
    }
  }, [messages]);

  if (!messages?.length) return null;

  return (
    <BillboardModal
      open={open}
      messages={messages}
      onClose={() => setOpen(false)}
    />
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd apps/frontend && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/billboard/index.ts apps/frontend/src/app/\(dashboard\)/layout.tsx apps/frontend/src/components/common/billboard-check.tsx
git commit -m "feat(billboard): integrate BillboardModal into dashboard layout"
```

---

### Task 12: Seed Script Example

**Files:**
- Create: `apps/backend/prisma/seed-billboard.ts`

**Interfaces:**
- Consumes: BillboardMessage model (Task 1)
- Produces: Reusable seed script for creating billboard messages

- [ ] **Step 1: Create seed-billboard.ts**

```typescript
// prisma/seed-billboard.ts
// Usage: pnpm ts-node prisma/seed-billboard.ts

import { PrismaClient } from './src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  const message = await prisma.billboardMessage.create({
    data: {
      title: 'Alertas resueltas ahora cubre todas las alertas',
      body: 'La funcionalidad de alertas resueltas ahora aplica a todas las alertas, no solo una. Ya no necesitas marcar cada alerta individualmente.',
      tag: 'alerts-solved',
      permissionTable: 'alerts',
      permissionAction: 'update',
      permissionScope: 'ALL',
      targetNewUsers: true,
    },
  });

  console.log('Created billboard message:', message.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 2: Commit**

```bash
git add apps/backend/prisma/seed-billboard.ts
git commit -m "feat(billboard): add seed script example for billboard messages"
```

---

### Task 13: Final Verification

- [ ] **Step 1: Run lint**

Run: `pnpm lint`
Expected: No new errors

- [ ] **Step 2: Run type check**

Run: `pnpm type-check`
Expected: No new errors

- [ ] **Step 3: Run tests**

Run: `pnpm test`
Expected: All tests pass (existing + new billboard tests)

- [ ] **Step 4: Run Prisma migration**

Run: `cd apps/backend && pnpm prisma migrate dev --name add-billboard`
Expected: Migration created successfully

- [ ] **Step 5: Verify backend starts**

Run: `pnpm dev:backend`
Expected: Server starts without errors, billboard endpoints available at `/billboard/unread` and `/billboard/read`

- [ ] **Step 6: Verify frontend starts**

Run: `pnpm dev:frontend`
Expected: Next.js starts, dashboard loads, BillboardCheck component mounts (no errors in console)

- [ ] **Step 7: Full commit (if not already committed)**

```bash
git add -A
git commit -m "feat(billboard): complete billboard announcements system"
```
