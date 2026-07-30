# Alert Comments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a comment thread system to Siembra Retrasada and Faltante Plantas alerts with a `commentCount` indicator on all alert rows.

**Architecture:** New Prisma-managed `alert_comments` table in the main DB. Backend module at `modules/alertComments/` with no local DTOs (all schemas in `@vivero/shared`). Alert queries get `commentCount` via batch Prisma query merged in service layer. Frontend adds `MessageSquare` icon with dot indicator and a slide-over sheet for comment threads.

**Tech Stack:** NestJS, Prisma, MariaDB, Zod, TanStack Query, shadcn/ui Sheet, Lucide React

## Global Constraints

- No backend DTOs — all schemas in `packages/shared/src/schemas/alerts.schema.ts`
- No `l-` prefix on API paths — this is the main Prisma DB
- Module location: `apps/backend/src/modules/alertComments/` (not `legacy/`)
- Permission: existing `alerts` entity with `PROCESS` type for write access
- Spanish-only UI strings
- Use `@vivero/shared` for all type imports in backend
- Use `useSuspenseQuery` for all GET requests in frontend
- Use `ZodValidationPipe` for request validation
- Use `@CurrentUser()` decorator for JWT user extraction
- Conventional Commits enforced

---

## File Structure

### New Files
| File | Purpose |
|------|---------|
| `apps/backend/prisma/schema/alertComment.prisma` | Prisma model |
| `apps/backend/src/modules/alertComments/alertComments.module.ts` | NestJS module |
| `apps/backend/src/modules/alertComments/alertComments.controller.ts` | REST endpoints |
| `apps/backend/src/modules/alertComments/alertComments.service.ts` | Business logic |
| `apps/backend/src/modules/alertComments/alertComments.repository.ts` | Prisma queries |
| `apps/backend/src/modules/alertComments/__tests__/alertComments.service.spec.ts` | Service tests |
| `apps/backend/src/modules/alertComments/__tests__/alertComments.controller.spec.ts` | Controller tests |
| `apps/frontend/src/features/alerts/api/alertCommentsService.ts` | API service |
| `apps/frontend/src/features/alerts/hooks/useAlertComments.ts` | React hooks |
| `apps/frontend/src/features/alerts/components/shared/alert-comment-sheet.tsx` | Sheet component |

### Modified Files
| File | Change |
|------|--------|
| `packages/shared/src/schemas/alerts.schema.ts` | Add `commentCount` to 4 DTOs + new AlertComment schemas |
| `packages/shared/src/schemas/__tests__/alerts.schema.spec.ts` | Add tests for new schemas |
| `apps/backend/prisma/schema/user.prisma` | Add `alertComments` relation |
| `apps/backend/src/app.module.ts` | Register AlertCommentsModule |
| `apps/backend/src/modules/legacy/alerts/alerts.module.ts` | Import AlertCommentsModule |
| `apps/backend/src/modules/legacy/alerts/alerts.service.ts` | Inject repo, merge commentCount |
| `apps/backend/src/modules/legacy/alerts/alerts.service.spec.ts` | Test commentCount merging |
| `apps/frontend/src/features/alerts/components/shared/alert-columns.tsx` | Add comment icon column |
| `apps/frontend/src/lib/queryKeys.ts` | Add alertCommentsQueryKeys |
| `apps/frontend/src/lib/query-invalidation-map.ts` | Add createAlertComment |
| `apps/frontend/src/features/alerts/index.ts` | Export new components/hooks |

---

### Task 1: Shared Schemas — commentCount + AlertComment

**Files:**
- Modify: `packages/shared/src/schemas/alerts.schema.ts`
- Modify: `packages/shared/src/schemas/__tests__/alerts.schema.spec.ts`

**Interfaces:**
- Produces: `AlertCommentDto`, `CreateAlertCommentDto`, `CreateAlertCommentSchema`, `AlertCommentSchema`

- [ ] **Step 1: Add `commentCount` to all 4 alert DTOs**

Edit `packages/shared/src/schemas/alerts.schema.ts` — add `commentCount: z.number().default(0)` to each of the 4 schemas:

```typescript
export const SiembraRetrasadaDtoSchema = z.object({
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  codigoEspecie: z.string(),
  nombreEspecie: z.string(),
  injerto: z.string(),
  nrocont: z.string(),
  contenedor: z.string(),
  semSiembra: z.string(),
  fechaSugeridaSiembra: z.string(),
  fSiembra: z.number(),
  semEntrega: z.string(),
  fEnt: z.string(),
  estado: z.string(),
  commentCount: z.number().default(0),
});
```

Same pattern for `FaltaGerminacionDtoSchema`, `FaltantePlantasDtoSchema`, `FaltaPreExpedicionDtoSchema`.

- [ ] **Step 2: Add AlertComment schemas at the end of the file**

Append to `packages/shared/src/schemas/alerts.schema.ts`:

```typescript
// ============================================================================
// ALERT COMMENTS
// ============================================================================

export const AlertCommentSchema = z.object({
  id: z.string(),
  alertType: z.string(),
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  content: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  createdAt: z.string(),
});

export type AlertCommentDto = z.infer<typeof AlertCommentSchema>;

export const CreateAlertCommentSchema = z.object({
  alertType: z.enum(["SIEMBRA_RETRASADA", "FALTANTE_PLANTAS"]),
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  content: z.string().min(1, { message: "El comentario no puede estar vacío" }).max(500, { message: "Máximo 500 caracteres" }),
});

export type CreateAlertCommentDto = z.infer<typeof CreateAlertCommentSchema>;
```

- [ ] **Step 3: Update existing schema tests to include `commentCount`**

Edit `packages/shared/src/schemas/__tests__/alerts.schema.spec.ts` — add `commentCount` to all `valid` objects:

```typescript
// In SiembraRetrasadaDtoSchema valid object, add:
commentCount: 0,

// In FaltaGerminacionDtoSchema valid object, add:
commentCount: 0,

// In FaltantePlantasDtoSchema valid object, add:
commentCount: 0,

// In FaltaPreExpedicionDtoSchema valid object, add:
commentCount: 0,
```

- [ ] **Step 4: Add tests for new AlertComment schemas**

Append to `packages/shared/src/schemas/__tests__/alerts.schema.spec.ts`:

```typescript
import {
  SiembraRetrasadaDtoSchema,
  FaltaGerminacionDtoSchema,
  FaltantePlantasDtoSchema,
  FaltaPreExpedicionDtoSchema,
  AlertCommentSchema,
  CreateAlertCommentSchema,
} from '../alerts.schema';

// ... existing tests ...

describe('AlertCommentSchema', () => {
  const valid = {
    id: 'cuid123',
    alertType: 'SIEMBRA_RETRASADA',
    partidaId: 1045,
    anio: 2026,
    indice: 1,
    content: 'Sembrada el lunes',
    authorId: 'user-cuid',
    authorName: 'Juan Perez',
    createdAt: '2026-07-28T10:30:00.000Z',
  };

  it('accepts valid alert comment', () => {
    const result = AlertCommentSchema.parse(valid);
    expect(result.content).toBe('Sembrada el lunes');
    expect(result.authorName).toBe('Juan Perez');
  });

  it('rejects missing required fields', () => {
    expect(() => AlertCommentSchema.parse({ partidaId: 1 })).toThrow();
  });
});

describe('CreateAlertCommentSchema', () => {
  it('accepts valid create comment', () => {
    const result = CreateAlertCommentSchema.parse({
      alertType: 'SIEMBRA_RETRASADA',
      partidaId: 1045,
      anio: 2026,
      indice: 1,
      content: 'Sembrada el lunes',
    });
    expect(result.alertType).toBe('SIEMBRA_RETRASADA');
  });

  it('rejects empty content', () => {
    expect(() => CreateAlertCommentSchema.parse({
      alertType: 'SIEMBRA_RETRASADA',
      partidaId: 1045,
      anio: 2026,
      indice: 1,
      content: '',
    })).toThrow();
  });

  it('rejects content over 500 chars', () => {
    expect(() => CreateAlertCommentSchema.parse({
      alertType: 'SIEMBRA_RETRASADA',
      partidaId: 1045,
      anio: 2026,
      indice: 1,
      content: 'x'.repeat(501),
    })).toThrow();
  });

  it('rejects invalid alertType', () => {
    expect(() => CreateAlertCommentSchema.parse({
      alertType: 'INVALID',
      partidaId: 1045,
      anio: 2026,
      indice: 1,
      content: 'Test',
    })).toThrow();
  });
});
```

- [ ] **Step 5: Run shared package tests**

Run: `pnpm --filter @vivero/shared test`
Expected: All tests pass (existing + new)

- [ ] **Step 6: Rebuild shared package**

Run: `pnpm --filter @vivero/shared build`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add packages/shared/src/schemas/alerts.schema.ts packages/shared/src/schemas/__tests__/alerts.schema.spec.ts
git commit -m "feat(shared): add commentCount to alert DTOs and AlertComment schemas"
```

---

### Task 2: Prisma Model + Migration

**Files:**
- Create: `apps/backend/prisma/schema/alertComment.prisma`
- Modify: `apps/backend/prisma/schema/user.prisma`

**Interfaces:**
- Produces: `AlertComment` Prisma model

- [ ] **Step 1: Create alertComment.prisma**

Create `apps/backend/prisma/schema/alertComment.prisma`:

```prisma
model AlertComment {
  id        String   @id @default(cuid())
  alertType String   @db.VarChar(30)
  partidaId Int
  anio      Int
  indice    Int
  content   String   @db.VarChar(500)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([alertType, partidaId, anio, indice])
  @@map("alert_comments")
}
```

- [ ] **Step 2: Add relation to user.prisma**

Edit `apps/backend/prisma/schema/user.prisma` — add `alertComments AlertComment[]` to the User model:

```typescript
// Add inside User model, after auditLogs line:
  alertComments AlertComment[]
```

- [ ] **Step 3: Generate Prisma client**

Run: `pnpm --filter backend exec prisma generate`
Expected: Client generated successfully

- [ ] **Step 4: Create migration**

Run: `pnpm --filter backend exec prisma migrate dev --name add_alert_comments`
Expected: Migration created, DB updated

- [ ] **Step 5: Commit**

```bash
git add apps/backend/prisma/schema/alertComment.prisma apps/backend/prisma/schema/user.prisma apps/backend/prisma/migrations/
git commit -m "feat(db): add AlertComment Prisma model and migration"
```

---

### Task 3: Backend AlertCommentsModule — Repository

**Files:**
- Create: `apps/backend/src/modules/alertComments/alertComments.repository.ts`

**Interfaces:**
- Consumes: PrismaService (from `@prisma/client`)
- Produces: `AlertCommentsRepository.findByPartida()`, `.getCommentCounts()`, `.create()`

- [ ] **Step 1: Create the repository**

Create `apps/backend/src/modules/alertComments/alertComments.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateAlertCommentDto } from '@vivero/shared';

@Injectable()
export class AlertCommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByPartida(
    alertType: string,
    partidaId: number,
    anio: number,
    indice: number,
  ) {
    return this.prisma.alertComment.findMany({
      where: { alertType, partidaId, anio, indice },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { username: true } } },
    });
  }

  async getCommentCounts(
    alertType: string,
    keys: { partidaId: number; anio: number; indice: number }[],
  ) {
    if (keys.length === 0) return new Map<string, number>();

    const counts = await this.prisma.alertComment.groupBy({
      by: ['partidaId', 'anio', 'indice'],
      where: {
        alertType,
        OR: keys.map((k) => ({
          partidaId: k.partidaId,
          anio: k.anio,
          indice: k.indice,
        })),
      },
      _count: { id: true },
    });

    const map = new Map<string, number>();
    for (const c of counts) {
      map.set(`${c.partidaId}-${c.anio}-${c.indice}`, c._count.id);
    }
    return map;
  }

  async create(data: CreateAlertCommentDto, authorId: string) {
    return this.prisma.alertComment.create({
      data: {
        alertType: data.alertType,
        partidaId: data.partidaId,
        anio: data.anio,
        indice: data.indice,
        content: data.content,
        authorId,
      },
      include: { author: { select: { username: true } } },
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/backend/src/modules/alertComments/alertComments.repository.ts
git commit -m "feat(backend): add AlertCommentsRepository with Prisma queries"
```

---

### Task 4: Backend AlertCommentsModule — Service

**Files:**
- Create: `apps/backend/src/modules/alertComments/alertComments.service.ts`

**Interfaces:**
- Consumes: `AlertCommentsRepository`
- Produces: `AlertCommentsService.getComments()`, `.getCommentCounts()`, `.createComment()`

- [ ] **Step 1: Create the service**

Create `apps/backend/src/modules/alertComments/alertComments.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { AlertCommentsRepository } from './alertComments.repository';
import { CreateAlertCommentDto, AlertCommentDto } from '@vivero/shared';

@Injectable()
export class AlertCommentsService {
  constructor(private readonly repo: AlertCommentsRepository) {}

  async getComments(
    alertType: string,
    partidaId: number,
    anio: number,
    indice: number,
  ): Promise<AlertCommentDto[]> {
    const rows = await this.repo.findByPartida(alertType, partidaId, anio, indice);
    return rows.map((r) => ({
      id: r.id,
      alertType: r.alertType,
      partidaId: r.partidaId,
      anio: r.anio,
      indice: r.indice,
      content: r.content,
      authorId: r.authorId,
      authorName: r.author.username,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async getCommentCounts(
    alertType: string,
    keys: { partidaId: number; anio: number; indice: number }[],
  ): Promise<Map<string, number>> {
    return this.repo.getCommentCounts(alertType, keys);
  }

  async createComment(
    dto: CreateAlertCommentDto,
    authorId: string,
  ): Promise<AlertCommentDto> {
    const row = await this.repo.create(dto, authorId);
    return {
      id: row.id,
      alertType: row.alertType,
      partidaId: row.partidaId,
      anio: row.anio,
      indice: row.indice,
      content: row.content,
      authorId: row.authorId,
      authorName: row.author.username,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/backend/src/modules/alertComments/alertComments.service.ts
git commit -m "feat(backend): add AlertCommentsService"
```

---

### Task 5: Backend AlertCommentsModule — Controller + Module

**Files:**
- Create: `apps/backend/src/modules/alertComments/alertComments.controller.ts`
- Create: `apps/backend/src/modules/alertComments/alertComments.module.ts`
- Modify: `apps/backend/src/app.module.ts`

**Interfaces:**
- Consumes: `AlertCommentsService`, `ZodValidationPipe`, `@CurrentUser()`, `@RequirePermission`
- Produces: GET `/alert-comments/:alertType/:partidaId/:anio/:indice`, POST `/alert-comments`

- [ ] **Step 1: Create the controller**

Create `apps/backend/src/modules/alertComments/alertComments.controller.ts`:

```typescript
import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { AlertCommentsService } from './alertComments.service';
import {
  AlertCommentDto,
  CreateAlertCommentDto,
  CreateAlertCommentSchema,
} from '@vivero/shared';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation-pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';

@Controller('alert-comments')
export class AlertCommentsController {
  constructor(private readonly service: AlertCommentsService) {}

  @Get(':alertType/:partidaId/:anio/:indice')
  @RequirePermission({ tableName: 'alerts', action: 'read', scope: 'ALL' })
  async getComments(
    @Param('alertType') alertType: string,
    @Param('partidaId', ParseIntPipe) partidaId: number,
    @Param('anio', ParseIntPipe) anio: number,
    @Param('indice', ParseIntPipe) indice: number,
  ): Promise<AlertCommentDto[]> {
    return this.service.getComments(alertType, partidaId, anio, indice);
  }

  @Post()
  @RequirePermission({ tableName: 'alerts', action: 'create', scope: 'ALL' })
  async createComment(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateAlertCommentSchema))
    body: CreateAlertCommentDto,
  ): Promise<AlertCommentDto> {
    return this.service.createComment(body, user.id);
  }
}
```

- [ ] **Step 2: Create the module**

Create `apps/backend/src/modules/alertComments/alertComments.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AlertCommentsController } from './alertComments.controller';
import { AlertCommentsService } from './alertComments.service';
import { AlertCommentsRepository } from './alertComments.repository';

@Module({
  controllers: [AlertCommentsController],
  providers: [AlertCommentsService, AlertCommentsRepository],
  exports: [AlertCommentsService, AlertCommentsRepository],
})
export class AlertCommentsModule {}
```

- [ ] **Step 3: Register in app.module.ts**

Edit `apps/backend/src/app.module.ts` — add import and register:

```typescript
// Add import at top:
import { AlertCommentsModule } from './modules/alertComments/alertComments.module';

// Add in @Module imports array (after LegacyAlertsModule):
    AlertCommentsModule,
```

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/modules/alertComments/alertComments.controller.ts apps/backend/src/modules/alertComments/alertComments.module.ts apps/backend/src/app.module.ts
git commit -m "feat(backend): add AlertCommentsController and register module"
```

---

### Task 6: Backend — Merge commentCount into AlertsService

**Files:**
- Modify: `apps/backend/src/modules/legacy/alerts/alerts.module.ts`
- Modify: `apps/backend/src/modules/legacy/alerts/alerts.service.ts`
- Modify: `apps/backend/src/modules/legacy/alerts/alerts.service.spec.ts`

**Interfaces:**
- Consumes: `AlertCommentsRepository` (from Task 3)
- Produces: `commentCount` field populated in all alert DTO responses

- [ ] **Step 1: Import AlertCommentsModule in alerts.module.ts**

Edit `apps/backend/src/modules/legacy/alerts/alerts.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { AlertsRepository } from './repositories/alerts.repository';
import { AlertCommentsModule } from '../../alertComments/alertComments.module';

@Module({
  imports: [AlertCommentsModule],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsRepository],
})
export class LegacyAlertsModule {}
```

- [ ] **Step 2: Inject AlertCommentsRepository and merge commentCount in alerts.service.ts**

Edit `apps/backend/src/modules/legacy/alerts/alerts.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { AlertsRepository } from './repositories/alerts.repository';
import { AlertCommentsRepository } from '../../alertComments/alertComments.repository';
import {
  LegacySiembraRetrasada,
  LegacyFaltaGerminacion,
  LegacyFaltantePlantas,
  LegacyFaltaPreExpedicion,
} from './interfaces/alerts.interface';
import {
  SiembraRetrasadaDto,
  FaltaGerminacionDto,
  FaltantePlantasDto,
  FaltaPreExpedicionDto,
} from '@vivero/shared';

@Injectable()
export class AlertsService {
  constructor(
    private readonly alertsRepo: AlertsRepository,
    private readonly alertCommentsRepo: AlertCommentsRepository,
  ) {}

  // ... existing map methods stay the same ...

  private async mergeCommentCounts<T extends { partidaId: number; anio: number; indice: number }>(
    dtos: T[],
    alertType: string,
  ): Promise<(T & { commentCount: number })[]> {
    const keys = dtos.map((d) => ({ partidaId: d.partidaId, anio: d.anio, indice: d.indice }));
    const counts = await this.alertCommentsRepo.getCommentCounts(alertType, keys);
    return dtos.map((dto) => ({
      ...dto,
      commentCount: counts.get(`${dto.partidaId}-${dto.anio}-${dto.indice}`) ?? 0,
    }));
  }

  async getSiembraRetrasada(): Promise<SiembraRetrasadaDto[]> {
    const rows = await this.alertsRepo.findSiembraRetrasada();
    const dtos = rows.map((row) => this.mapSiembraRetrasada(row));
    return this.mergeCommentCounts(dtos, 'SIEMBRA_RETRASADA');
  }

  async getFaltaGerminacion(): Promise<FaltaGerminacionDto[]> {
    const rows = await this.alertsRepo.findFaltaGerminacion();
    const dtos = rows.map((row) => this.mapFaltaGerminacion(row));
    return this.mergeCommentCounts(dtos, 'FALTA_GERMINACION');
  }

  async getFaltantePlantas(): Promise<FaltantePlantasDto[]> {
    const rows = await this.alertsRepo.findFaltantePlantas();
    const dtos = rows.map((row) => this.mapFaltantePlantas(row));
    return this.mergeCommentCounts(dtos, 'FALTANTE_PLANTAS');
  }

  async getFaltaPreExpedicion(): Promise<FaltaPreExpedicionDto[]> {
    const rows = await this.alertsRepo.findFaltaPreExpedicion();
    const dtos = rows.map((row) => this.mapFaltaPreExpedicion(row));
    return this.mergeCommentCounts(dtos, 'FALTA_PRE_EXPEDICION');
  }
}
```

- [ ] **Step 3: Update alerts.service.spec.ts to test commentCount merging**

Edit `apps/backend/src/modules/legacy/alerts/alerts.service.spec.ts` — add mock for AlertCommentsRepository and test commentCount:

```typescript
// Add to the mock providers array:
const mockAlertCommentsRepo = {
  getCommentCounts: jest.fn().mockResolvedValue(new Map()),
};

// In beforeEach, add:
mockAlertCommentsRepo.getCommentCounts.mockResolvedValue(new Map());

// Add test:
it('merges commentCount from AlertCommentsRepository', async () => {
  const countsMap = new Map([['1045-2026-1', 3]]);
  mockAlertCommentsRepo.getCommentCounts.mockResolvedValue(countsMap);

  const result = await service.getSiembraRetrasada();

  expect(result[0].commentCount).toBe(3);
  expect(mockAlertCommentsRepo.getCommentCounts).toHaveBeenCalledWith(
    'SIEMBRA_RETRASADA',
    expect.arrayContaining([
      expect.objectContaining({ partidaId: 1045, anio: 2026, indice: 1 }),
    ]),
  );
});

it('defaults commentCount to 0 when no comments exist', async () => {
  const result = await service.getSiembraRetrasada();
  expect(result[0].commentCount).toBe(0);
});
```

- [ ] **Step 4: Run backend tests**

Run: `pnpm --filter backend test`
Expected: All tests pass (existing + new commentCount tests)

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/modules/legacy/alerts/alerts.module.ts apps/backend/src/modules/legacy/alerts/alerts.service.ts apps/backend/src/modules/legacy/alerts/alerts.service.spec.ts
git commit -m "feat(backend): merge commentCount into alert DTOs via batch query"
```

---

### Task 7: Frontend — Query Keys + Invalidation Map + Service

**Files:**
- Modify: `apps/frontend/src/lib/queryKeys.ts`
- Modify: `apps/frontend/src/lib/query-invalidation-map.ts`
- Create: `apps/frontend/src/features/alerts/api/alertCommentsService.ts`

**Interfaces:**
- Consumes: `clientFetch`, `AlertCommentDto`, `CreateAlertCommentDto` from `@vivero/shared`
- Produces: `alertCommentsQueryKeys`, `alertCommentsService`

- [ ] **Step 1: Add alertCommentsQueryKeys to queryKeys.ts**

Edit `apps/frontend/src/lib/queryKeys.ts` — append:

```typescript
// ============================================================================
// ALERT COMMENTS
// ============================================================================

export const alertCommentsQueryKeys = {
  all: () => ["alert-comments"] as const,
  byPartida: (alertType: string, partidaId: number, anio: number, indice: number) =>
    [...alertCommentsQueryKeys.all(), alertType, partidaId, anio, indice] as const,
};
```

- [ ] **Step 2: Add createAlertComment to invalidation map**

Edit `apps/frontend/src/lib/query-invalidation-map.ts` — add import and entry:

```typescript
// Add to imports:
import {
  // ... existing imports ...
  alertCommentsQueryKeys,
} from "./queryKeys";

// Add in mutationInvalidationMap (after siembraPartida):
  createAlertComment: {
    queries: (variables: { alertType: string; partidaId: number; anio: number; indice: number }) => [
      alertCommentsQueryKeys.byPartida(variables.alertType, variables.partidaId, variables.anio, variables.indice),
    ],
  },
```

- [ ] **Step 3: Create alertCommentsService.ts**

Create `apps/frontend/src/features/alerts/api/alertCommentsService.ts`:

```typescript
import { clientFetch } from "@/lib/api/client-fetch";
import type { AlertCommentDto, CreateAlertCommentDto } from "@vivero/shared";

export const alertCommentsService = {
  fetchComments: (alertType: string, partidaId: number, anio: number, indice: number) =>
    clientFetch<AlertCommentDto[]>(
      `alert-comments/${alertType}/${partidaId}/${anio}/${indice}`,
      { method: "GET" },
    ),

  createComment: (data: CreateAlertCommentDto) =>
    clientFetch<AlertCommentDto>("alert-comments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
```

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/lib/queryKeys.ts apps/frontend/src/lib/query-invalidation-map.ts apps/frontend/src/features/alerts/api/alertCommentsService.ts
git commit -m "feat(frontend): add alert comments query keys, invalidation map, and service"
```

---

### Task 8: Frontend — useAlertComments Hook

**Files:**
- Create: `apps/frontend/src/features/alerts/hooks/useAlertComments.ts`

**Interfaces:**
- Consumes: `alertCommentsService`, `alertCommentsQueryKeys`, `invalidateQueries`
- Produces: `useAlertComments()`, `useCreateAlertComment()`

- [ ] **Step 1: Create the hook**

Create `apps/frontend/src/features/alerts/hooks/useAlertComments.ts`:

```typescript
"use client";

import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { alertCommentsService } from "../api/alertCommentsService";
import { alertCommentsQueryKeys } from "@/lib/queryKeys";
import { invalidateQueries } from "@/lib/query-invalidation-map";
import type { CreateAlertCommentDto } from "@vivero/shared";

export function useAlertComments(
  alertType: string,
  partidaId: number,
  anio: number,
  indice: number,
) {
  return useSuspenseQuery({
    queryKey: alertCommentsQueryKeys.byPartida(alertType, partidaId, anio, indice),
    queryFn: () => alertCommentsService.fetchComments(alertType, partidaId, anio, indice),
  });
}

export function useCreateAlertComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: alertCommentsService.createComment,
    onSuccess: (_data, variables) => {
      invalidateQueries(queryClient, "createAlertComment", variables);
      toast.success("Comentario agregado");
    },
    onError: () => {
      toast.error("Error al agregar comentario");
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/features/alerts/hooks/useAlertComments.ts
git commit -m "feat(frontend): add useAlertComments hook with useSuspenseQuery and mutation"
```

---

### Task 9: Frontend — AlertCommentSheet Component

**Files:**
- Create: `apps/frontend/src/features/alerts/components/shared/alert-comment-sheet.tsx`

**Interfaces:**
- Consumes: `useAlertComments`, `useCreateAlertComment`, `Sheet`/`SheetContent` from shadcn
- Produces: `<AlertCommentSheet>` component

- [ ] **Step 1: Create the sheet component**

Create `apps/frontend/src/features/alerts/components/shared/alert-comment-sheet.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAlertComments, useCreateAlertComment } from "../../hooks/useAlertComments";
import { usePermission } from "@/hooks/usePermission";
import type { AlertCommentDto } from "@vivero/shared";

interface AlertCommentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alertType: string;
  partidaId: number;
  anio: number;
  indice: number;
  codigoEspecie?: string;
  nombreEspecie?: string;
}

export function AlertCommentSheet({
  open,
  onOpenChange,
  alertType,
  partidaId,
  anio,
  indice,
  codigoEspecie,
  nombreEspecie,
}: AlertCommentSheetProps) {
  const [content, setContent] = useState("");
  const { canCreate } = usePermission("alerts");
  const { data: comments } = useAlertComments(alertType, partidaId, anio, indice);
  const createComment = useCreateAlertComment();

  const handleSubmit = () => {
    if (!content.trim()) return;
    createComment.mutate(
      { alertType, partidaId, anio, indice, content: content.trim() },
      { onSuccess: () => setContent("") },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col h-dvh p-0">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            Comentarios
          </SheetTitle>
          <SheetDescription className="text-xs">
            #{partidaId}{indice !== 0 && ` / ${indice}`} — {codigoEspecie} {nombreEspecie}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-6 py-4">
            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Sin comentarios</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment: AlertCommentDto) => (
                  <div key={comment.id} className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold">{comment.authorName}</span>
                      <span className="text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {canCreate && (
          <div className="px-6 py-3 border-t shrink-0">
            <div className="flex gap-2">
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Agregar comentario..."
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                disabled={createComment.isPending}
              />
              <Button
                size="icon"
                onClick={handleSubmit}
                disabled={!content.trim() || createComment.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/features/alerts/components/shared/alert-comment-sheet.tsx
git commit -m "feat(frontend): add AlertCommentSheet slide-over component"
```

---

### Task 10: Frontend — Add Comment Icon to Alert Columns

**Files:**
- Modify: `apps/frontend/src/features/alerts/components/shared/alert-columns.tsx`
- Modify: `apps/frontend/src/features/alerts/components/v1/AlertsDashboardV1.tsx`

**Interfaces:**
- Consumes: `AlertCommentSheet`, `MessageSquare` icon
- Produces: Comment icon column in SiembraRetrasada and FaltantePlantas tables

- [ ] **Step 1: Add comment icon column to siembraRetrasadaColumns**

Edit `apps/frontend/src/features/alerts/components/shared/alert-columns.tsx` — add `MessageSquare` import and comment column:

```typescript
// Add to imports at top:
import { MessageSquare } from "lucide-react";

// Add as LAST column in siembraRetrasadaColumns array:
  {
    id: "comments",
    header: "",
    cell: ({ row }) => {
      const count = row.original.commentCount;
      return (
        <div className="relative">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
          )}
        </div>
      );
    },
    size: 40,
  },
```

- [ ] **Step 2: Add same comment column to faltantePlantasColumns**

Same pattern — add as LAST column in `faltantePlantasColumns` array.

- [ ] **Step 3: Add state + sheet to AlertsDashboardV1**

Edit `apps/frontend/src/features/alerts/components/v1/AlertsDashboardV1.tsx`:

```typescript
// Add imports:
import { useState } from "react";
import { AlertCommentSheet } from "../shared/alert-comment-sheet";

// Add state inside AlertsContent:
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);
  const [selectedAlertForComment, setSelectedAlertForComment] = useState<{
    alertType: string;
    partidaId: number;
    anio: number;
    indice: number;
    codigoEspecie?: string;
    nombreEspecie?: string;
  } | null>(null);

// Add handler:
  const handleCommentClick = (alertType: string, row: { partidaId: number; anio: number; indice: number; codigoEspecie?: string; nombreEspecie?: string }) => {
    setSelectedAlertForComment({ alertType, ...row });
    setCommentSheetOpen(true);
  };

// Add Sheet component before closing </div> in AlertsContent:
      {selectedAlertForComment && (
        <AlertCommentSheet
          open={commentSheetOpen}
          onOpenChange={setCommentSheetOpen}
          alertType={selectedAlertForComment.alertType}
          partidaId={selectedAlertForComment.partidaId}
          anio={selectedAlertForComment.anio}
          indice={selectedAlertForComment.indice}
          codigoEspecie={selectedAlertForComment.codigoEspecie}
          nombreEspecie={selectedAlertForComment.nombreEspecie}
        />
      )}
```

- [ ] **Step 4: Wire onCommentClick into AlertSection columns**

The columns need an `onCommentClick` callback. Update `AlertSection` to accept and pass it, or use a closure in the column definitions. The simplest approach: define columns inside `AlertsContent` with the handler baked in, or pass `onCommentClick` as a prop to `AlertSection` and use it in column cell renderers.

- [ ] **Step 5: Update alerts index.ts exports**

Edit `apps/frontend/src/features/alerts/index.ts`:

```typescript
// Add to Components section:
export { AlertCommentSheet } from "./components/shared/alert-comment-sheet";

// Add to Hooks section:
export { useAlertComments, useCreateAlertComment } from "./hooks/useAlertComments";

// Add to Services section:
export { alertCommentsService } from "./api/alertCommentsService";
```

- [ ] **Step 6: Run frontend lint**

Run: `pnpm --filter frontend lint`
Expected: 0 errors (warnings OK)

- [ ] **Step 7: Run frontend tests**

Run: `pnpm --filter frontend test`
Expected: All tests pass

- [ ] **Step 8: Commit**

```bash
git add apps/frontend/src/features/alerts/components/shared/alert-columns.tsx apps/frontend/src/features/alerts/components/v1/AlertsDashboardV1.tsx apps/frontend/src/features/alerts/index.ts
git commit -m "feat(frontend): add comment icon to alert tables with dot indicator and sheet"
```

---

### Task 11: Backend — AlertComments Unit Tests

**Files:**
- Create: `apps/backend/src/modules/alertComments/__tests__/alertComments.service.spec.ts`
- Create: `apps/backend/src/modules/alertComments/__tests__/alertComments.controller.spec.ts`

**Interfaces:**
- Consumes: Mocked AlertCommentsRepository
- Produces: Passing unit tests for service and controller

- [ ] **Step 1: Create service spec**

Create `apps/backend/src/modules/alertComments/__tests__/alertComments.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AlertCommentsService } from '../alertComments.service';
import { AlertCommentsRepository } from '../alertComments.repository';

describe('AlertCommentsService', () => {
  let service: AlertCommentsService;

  const mockRepo = {
    findByPartida: jest.fn(),
    getCommentCounts: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertCommentsService,
        { provide: AlertCommentsRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<AlertCommentsService>(AlertCommentsService);
    jest.clearAllMocks();
  });

  describe('getComments', () => {
    it('returns mapped comments with authorName', async () => {
      mockRepo.findByPartida.mockResolvedValue([
        {
          id: 'c1',
          alertType: 'SIEMBRA_RETRASADA',
          partidaId: 1045,
          anio: 2026,
          indice: 1,
          content: 'Test comment',
          authorId: 'u1',
          author: { username: 'Juan' },
          createdAt: new Date('2026-07-28T10:00:00Z'),
        },
      ]);

      const result = await service.getComments('SIEMBRA_RETRASADA', 1045, 2026, 1);

      expect(result).toHaveLength(1);
      expect(result[0].authorName).toBe('Juan');
      expect(result[0].content).toBe('Test comment');
    });
  });

  describe('getCommentCounts', () => {
    it('delegates to repository', async () => {
      const map = new Map([['1045-2026-1', 2]]);
      mockRepo.getCommentCounts.mockResolvedValue(map);

      const result = await service.getCommentCounts('SIEMBRA_RETRASADA', [
        { partidaId: 1045, anio: 2026, indice: 1 },
      ]);

      expect(result.get('1045-2026-1')).toBe(2);
    });
  });

  describe('createComment', () => {
    it('creates and returns mapped comment', async () => {
      mockRepo.create.mockResolvedValue({
        id: 'c2',
        alertType: 'SIEMBRA_RETRASADA',
        partidaId: 1045,
        anio: 2026,
        indice: 1,
        content: 'New comment',
        authorId: 'u1',
        author: { username: 'Juan' },
        createdAt: new Date('2026-07-28T11:00:00Z'),
      });

      const result = await service.createComment(
        { alertType: 'SIEMBRA_RETRASADA', partidaId: 1045, anio: 2026, indice: 1, content: 'New comment' },
        'u1',
      );

      expect(result.content).toBe('New comment');
      expect(result.authorName).toBe('Juan');
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'New comment' }),
        'u1',
      );
    });
  });
});
```

- [ ] **Step 2: Create controller spec**

Create `apps/backend/src/modules/alertComments/__tests__/alertComments.controller.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AlertCommentsController } from '../alertComments.controller';
import { AlertCommentsService } from '../alertComments.service';

describe('AlertCommentsController', () => {
  let controller: AlertCommentsController;

  const mockService = {
    getComments: jest.fn(),
    createComment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertCommentsController],
      providers: [{ provide: AlertCommentsService, useValue: mockService }],
    }).compile();

    controller = module.get<AlertCommentsController>(AlertCommentsController);
    jest.clearAllMocks();
  });

  describe('GET /alert-comments/:alertType/:partidaId/:anio/:indice', () => {
    it('returns comments for a partida', async () => {
      const mockData = [
        { id: 'c1', content: 'Test', authorName: 'Juan', alertType: 'SIEMBRA_RETRASADA', partidaId: 1045, anio: 2026, indice: 1, authorId: 'u1', createdAt: '2026-07-28T10:00:00Z' },
      ];
      mockService.getComments.mockResolvedValue(mockData);

      const result = await controller.getComments('SIEMBRA_RETRASADA', 1045, 2026, 1);

      expect(result).toEqual(mockData);
      expect(mockService.getComments).toHaveBeenCalledWith('SIEMBRA_RETRASADA', 1045, 2026, 1);
    });
  });

  describe('POST /alert-comments', () => {
    it('creates a comment with authorId from JWT', async () => {
      const mockComment = { id: 'c2', content: 'New', authorName: 'Juan', alertType: 'SIEMBRA_RETRASADA', partidaId: 1045, anio: 2026, indice: 1, authorId: 'u1', createdAt: '2026-07-28T11:00:00Z' };
      mockService.createComment.mockResolvedValue(mockComment);

      const result = await controller.createComment(
        { id: 'u1', username: 'juan' } as any,
        { alertType: 'SIEMBRA_RETRASADA', partidaId: 1045, anio: 2026, indice: 1, content: 'New' },
      );

      expect(result).toEqual(mockComment);
      expect(mockService.createComment).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'New' }),
        'u1',
      );
    });
  });
});
```

- [ ] **Step 3: Run backend tests**

Run: `pnpm --filter backend test`
Expected: All tests pass (existing + new alertComments tests)

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/modules/alertComments/__tests__/
git commit -m "test(backend): add AlertComments service and controller unit tests"
```

---

### Task 12: Frontend — AlertCommentSheet + Service Tests

**Files:**
- Create: `apps/frontend/src/features/alerts/__tests__/alertCommentsService.test.ts`
- Create: `apps/frontend/src/features/alerts/__tests__/useAlertComments.test.tsx`

**Interfaces:**
- Consumes: Mocked `clientFetch`
- Produces: Passing frontend tests

- [ ] **Step 1: Create alertCommentsService.test.ts**

Create `apps/frontend/src/features/alerts/__tests__/alertCommentsService.test.ts`:

```typescript
import { alertCommentsService } from '../api/alertCommentsService';

jest.mock('@/lib/api/client-fetch', () => ({
  clientFetch: jest.fn(),
}));

import { clientFetch } from '@/lib/api/client-fetch';
const mockClientFetch = clientFetch as jest.MockedFunction<typeof clientFetch>;

describe('alertCommentsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchComments', () => {
    it('calls correct URL', async () => {
      mockClientFetch.mockResolvedValue([] as never);

      await alertCommentsService.fetchComments('SIEMBRA_RETRASADA', 1045, 2026, 1);

      expect(mockClientFetch).toHaveBeenCalledWith(
        'alert-comments/SIEMBRA_RETRASADA/1045/2026/1',
        { method: 'GET' },
      );
    });
  });

  describe('createComment', () => {
    it('calls correct URL with POST body', async () => {
      mockClientFetch.mockResolvedValue({ id: 'c1' } as never);

      await alertCommentsService.createComment({
        alertType: 'SIEMBRA_RETRASADA',
        partidaId: 1045,
        anio: 2026,
        indice: 1,
        content: 'Test',
      });

      expect(mockClientFetch).toHaveBeenCalledWith('alert-comments', {
        method: 'POST',
        body: JSON.stringify({
          alertType: 'SIEMBRA_RETRASADA',
          partidaId: 1045,
          anio: 2026,
          indice: 1,
          content: 'Test',
        }),
      });
    });
  });
});
```

- [ ] **Step 2: Create useAlertComments.test.tsx**

Create `apps/frontend/src/features/alerts/__tests__/useAlertComments.test.tsx`:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useAlertComments } from '../hooks/useAlertComments';

const mockFetchComments = jest.fn();

jest.mock('@/features/alerts/api/alertCommentsService', () => ({
  alertCommentsService: {
    fetchComments: (...args: unknown[]) => mockFetchComments(...args),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryWrapper';
  return Wrapper;
};

describe('useAlertComments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls fetchComments and returns data', async () => {
    const mockData = [{ id: 'c1', content: 'Test', authorName: 'Juan' }];
    mockFetchComments.mockResolvedValue(mockData);

    const { result } = renderHook(
      () => useAlertComments('SIEMBRA_RETRASADA', 1045, 2026, 1),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(mockFetchComments).toHaveBeenCalledWith('SIEMBRA_RETRASADA', 1045, 2026, 1);
  });
});
```

- [ ] **Step 3: Run frontend tests**

Run: `pnpm --filter frontend test`
Expected: All tests pass

- [ ] **Step 4: Run lint**

Run: `pnpm lint`
Expected: 0 errors

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/alerts/__tests__/alertCommentsService.test.ts apps/frontend/src/features/alerts/__tests__/useAlertComments.test.tsx
git commit -m "test(frontend): add alert comments service and hook tests"
```

---

### Task 13: Final Verification

- [ ] **Step 1: Run full lint**

Run: `pnpm lint`
Expected: 0 errors

- [ ] **Step 2: Run all tests**

Run: `pnpm test`
Expected: All frontend + backend tests pass

- [ ] **Step 3: Verify shared package builds**

Run: `pnpm --filter @vivero/shared build`
Expected: Build succeeds

- [ ] **Step 4: Verify type-check**

Run: `pnpm type-check` (if available) or check for TypeScript errors
Expected: No type errors

- [ ] **Step 5: Final commit (if any fixups needed)**
