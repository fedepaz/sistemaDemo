# Filter Solved Alerts from Legacy Queries — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Filter solved alerts from legacy alert endpoints so that once a user marks an alert as solved, it disappears from the alerts table for all users.

**Architecture:** Import `AlertSolvedModule` into `LegacyAlertsModule`, inject `AlertSolvedService` into `AlertsService`, and filter each `get*()` method's results against the solved keys set. Frontend invalidation updated to refetch alerts after marking one as solved.

**Tech Stack:** NestJS 11, Prisma, MariaDB, React Query, TypeScript

## Global Constraints

- Legacy MySQL database (`partidas`/`articulo` tables) must not be modified.
- All data types in `packages/shared/src/schemas/`.
- Conventional Commits enforced by commitlint.
- Relative imports inside `apps/backend`.
- Tests before feature code (TDD).

---

## File Structure

| File | Responsibility |
|------|---------------|
| `apps/backend/src/modules/alertSolved/repositories/alertSolved.repository.ts` | Add `returnAll` param to `findAllAlertsSolved` |
| `apps/backend/src/modules/alertSolved/alertSolved.service.ts` | Pass through `returnAll` param |
| `apps/backend/src/modules/legacy/alerts/alerts.module.ts` | Import `AlertSolvedModule` |
| `apps/backend/src/modules/legacy/alerts/alerts.service.ts` | Inject `AlertSolvedService`, add filtering helpers, update 4 `get*()` methods |
| `apps/backend/src/modules/legacy/alerts/__tests__/alerts.service.spec.ts` | Add tests for solved-alert filtering |
| `apps/frontend/src/lib/query-invalidation-map.ts` | Add `alertsQueryKeys.all()` to `createAlertSolved` |

---

### Task 1: Add `returnAll` parameter to AlertSolvedRepository and AlertSolvedService

**Files:**
- Modify: `apps/backend/src/modules/alertSolved/repositories/alertSolved.repository.ts`
- Modify: `apps/backend/src/modules/alertSolved/alertSolved.service.ts`

**Interfaces:**
- Consumes: None (standalone change)
- Produces: `AlertSolvedService.getSolvedAlerts(requesterId, returnAll)` — later tasks call this with `returnAll = true`

- [ ] **Step 1: Add `returnAll` param to repository**

Edit `apps/backend/src/modules/alertSolved/repositories/alertSolved.repository.ts`:

```typescript
async findAllAlertsSolved(
  requesterId: string,
  returnAll = false,
): Promise<AlertSolvedWithUser[]> {
  if (returnAll) {
    return this.prisma.alertsSolved.findMany({
      include: { user: { select: { username: true } } },
    });
  }

  const devIds = await this.getDevAccounts();

  if (devIds.includes(requesterId)) {
    return this.prisma.alertsSolved.findMany({
      include: { user: { select: { username: true } } },
    });
  }
  return this.prisma.alertsSolved.findMany({
    where: {
      deletedAt: null,
      isActive: true,
      id: {
        notIn: devIds,
      },
    },
    include: { user: { select: { username: true } } },
  });
}
```

- [ ] **Step 2: Pass through `returnAll` in service**

Edit `apps/backend/src/modules/alertSolved/alertSolved.service.ts`:

```typescript
async getSolvedAlerts(
  requesterId: string,
  returnAll = false,
): Promise<AlertSolvedDto[]> {
  const rows = await this.repo.findAllAlertsSolved(requesterId, returnAll);
  return rows.map((r) => ({
    id: r.id,
    partidaId: r.partidaId,
    anio: r.anio,
    indice: r.indice,
    userId: r.userId,
    userName: r.user.username,
    createdAt: r.createdAt.toISOString(),
  }));
}
```

- [ ] **Step 3: Run type check**

Run: `pnpm --filter backend type-check`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/modules/alertSolved/repositories/alertSolved.repository.ts apps/backend/src/modules/alertSolved/alertSolved.service.ts
git commit -m "feat(alertSolved): add returnAll param to bypass user filtering"
```

---

### Task 2: Add filtering tests to AlertsService (TDD — write failing tests first)

**Files:**
- Modify: `apps/backend/src/modules/legacy/alerts/__tests__/alerts.service.spec.ts`

**Interfaces:**
- Consumes: `AlertSolvedService.getSolvedAlerts(requesterId, returnAll)` (from Task 1)
- Produces: Tests that will pass after Task 3 implements the filtering

- [ ] **Step 1: Add AlertSolvedService mock to test setup**

Edit `apps/backend/src/modules/legacy/alerts/__tests__/alerts.service.spec.ts`. Add the mock after `mockAlertCommentsRepo`:

```typescript
const mockAlertSolvedService = {
  getSolvedAlerts: jest.fn().mockResolvedValue([]),
};
```

Update the `providers` array in `beforeEach` to include the new mock:

```typescript
providers: [
  AlertsService,
  { provide: AlertsRepository, useValue: mockRepository },
  { provide: AlertCommentsRepository, useValue: mockAlertCommentsRepo },
  { provide: AlertSolvedService, useValue: mockAlertSolvedService },
],
```

Add the import at the top:

```typescript
import { AlertSolvedService } from '../../../alertSolved/alertSolved.service';
```

Clear the mock in `beforeEach`:

```typescript
mockAlertSolvedService.getSolvedAlerts.mockResolvedValue([]);
```

- [ ] **Step 2: Add test — filters solved alerts from siembraRetrasada**

Add inside `describe('getSiembraRetrasada')`:

```typescript
it('filters out solved alerts', async () => {
  const legacyRows: LegacySiembraRetrasada[] = [
    {
      partida: 1045,
      ano: 2026,
      indice: 1,
      planta: 'EUC01',
      nombre: 'Eucalipto Grandis',
      injerto: 'I001',
      nrocont: '48',
      semSiembra: '24-2026',
      f_siem: '2026-06-01',
      f_siembra: 0,
      semEntrega: '28-2026 1',
      f_ent: '2026-07-15',
      estado: 'PENDIENTE',
    } as LegacySiembraRetrasada,
    {
      partida: 1046,
      ano: 2026,
      indice: 1,
      planta: 'ROS01',
      nombre: 'Rosa',
      injerto: 'I002',
      nrocont: '50',
      semSiembra: '24-2026',
      f_siem: '2026-06-01',
      f_siembra: 0,
      semEntrega: '28-2026 1',
      f_ent: '2026-07-15',
      estado: 'PENDIENTE',
    } as LegacySiembraRetrasada,
  ];

  repository.findSiembraRetrasada.mockResolvedValue(legacyRows);
  mockAlertSolvedService.getSolvedAlerts.mockResolvedValue([
    {
      id: 'solved-1',
      partidaId: 1045,
      anio: 2026,
      indice: 1,
      userId: 'user-1',
      userName: 'admin',
      createdAt: '2026-08-13T00:00:00.000Z',
    },
  ]);

  const result = await service.getSiembraRetrasada();

  expect(result).toHaveLength(1);
  expect(result[0].partidaId).toBe(1046);
  expect(mockAlertSolvedService.getSolvedAlerts).toHaveBeenCalledWith('', true);
});
```

- [ ] **Step 3: Add test — returns all alerts when none are solved**

Add inside `describe('getSiembraRetrasada')`:

```typescript
it('returns all alerts when none are solved', async () => {
  const legacyRows: LegacySiembraRetrasada[] = [
    {
      partida: 1045,
      ano: 2026,
      indice: 1,
      planta: 'EUC01',
      nombre: 'Eucalipto Grandis',
      injerto: 'I001',
      nrocont: '48',
      semSiembra: '24-2026',
      f_siem: '2026-06-01',
      f_siembra: 0,
      semEntrega: '28-2026 1',
      f_ent: '2026-07-15',
      estado: 'PENDIENTE',
    } as LegacySiembraRetrasada,
  ];

  repository.findSiembraRetrasada.mockResolvedValue(legacyRows);
  mockAlertSolvedService.getSolvedAlerts.mockResolvedValue([]);

  const result = await service.getSiembraRetrasada();

  expect(result).toHaveLength(1);
});
```

- [ ] **Step 4: Add test — filters solved alerts from faltaGerminacion**

Add inside `describe('getFaltaGerminacion')`:

```typescript
it('filters out solved alerts', async () => {
  const legacyRows: LegacyFaltaGerminacion[] = [
    {
      partida: 1050,
      ano: 2026,
      indice: 1,
      planta: 'ROS01',
      nombre: 'Rosa Hybrid Tea',
      injerto: 'I002',
      nrocont: '104',
      f_primer: '2026-07-01',
      pr: '0',
    } as LegacyFaltaGerminacion,
  ];

  repository.findFaltaGerminacion.mockResolvedValue(legacyRows);
  mockAlertSolvedService.getSolvedAlerts.mockResolvedValue([
    {
      id: 'solved-2',
      partidaId: 1050,
      anio: 2026,
      indice: 1,
      userId: 'user-1',
      userName: 'admin',
      createdAt: '2026-08-13T00:00:00.000Z',
    },
  ]);

  const result = await service.getFaltaGerminacion();

  expect(result).toHaveLength(0);
});
```

- [ ] **Step 5: Add test — filters solved alerts from faltantePlantas**

Add inside `describe('getFaltantePlantas')`:

```typescript
it('filters out solved alerts', async () => {
  const legacyRows: LegacyFaltantePlantas[] = [
    {
      partida: 1048,
      ano: 2026,
      indice: 1,
      siembras: 3,
      planta: 'EUC01',
      nombre: 'Eucalipto Grandis',
      nrocont: '500',
      solicito: 500,
      producido: 342,
      diferencia: -158,
    } as unknown as LegacyFaltantePlantas,
  ];

  repository.findFaltantePlantas.mockResolvedValue(legacyRows);
  mockAlertSolvedService.getSolvedAlerts.mockResolvedValue([
    {
      id: 'solved-3',
      partidaId: 1048,
      anio: 2026,
      indice: 1,
      userId: 'user-1',
      userName: 'admin',
      createdAt: '2026-08-13T00:00:00.000Z',
    },
  ]);

  const result = await service.getFaltantePlantas();

  expect(result).toHaveLength(0);
});
```

- [ ] **Step 6: Add test — filters solved alerts from faltaPreExpedicion**

Add inside `describe('getFaltaPreExpedicion')`:

```typescript
it('filters out solved alerts', async () => {
  const legacyRows: LegacyFaltaPreExpedicion[] = [
    {
      partida: 1052,
      ano: 2026,
      indice: 1,
      planta: 'LIM02',
      nombre: 'Limonero Volkameriano',
      injerto: 'I003',
      nrocont: '96',
      f_preexp: '2026-07-20',
      pe: 0,
    } as LegacyFaltaPreExpedicion,
  ];

  repository.findFaltaPreExpedicion.mockResolvedValue(legacyRows);
  mockAlertSolvedService.getSolvedAlerts.mockResolvedValue([
    {
      id: 'solved-4',
      partidaId: 1052,
      anio: 2026,
      indice: 1,
      userId: 'user-1',
      userName: 'admin',
      createdAt: '2026-08-13T00:00:00.000Z',
    },
  ]);

  const result = await service.getFaltaPreExpedicion();

  expect(result).toHaveLength(0);
});
```

- [ ] **Step 7: Run tests to verify they FAIL**

Run: `pnpm --filter backend test -- --testPathPattern="alerts.service.spec"`
Expected: FAIL — `AlertSolvedService` is not provided, filtering logic doesn't exist yet.

- [ ] **Step 8: Commit (failing tests)**

```bash
git add apps/backend/src/modules/legacy/alerts/__tests__/alerts.service.spec.ts
git commit -m "test(alerts): add failing tests for solved-alert filtering"
```

---

### Task 3: Implement filtering logic in AlertsService + wire module

**Files:**
- Modify: `apps/backend/src/modules/legacy/alerts/alerts.module.ts`
- Modify: `apps/backend/src/modules/legacy/alerts/alerts.service.ts`

**Interfaces:**
- Consumes: `AlertSolvedService.getSolvedAlerts(requesterId, returnAll)` from Task 1
- Produces: Filtered alert DTOs from all 4 `get*()` methods

- [ ] **Step 1: Import AlertSolvedModule into LegacyAlertsModule**

Edit `apps/backend/src/modules/legacy/alerts/alerts.module.ts`:

```typescript
// src/modules/legacy/alerts/alerts.module.ts

import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { AlertsRepository } from './repositories/alerts.repository';
import { AlertCommentsModule } from '../../alertComments/alertComments.module';
import { AlertSolvedModule } from '../../alertSolved/alertSolved.module';

@Module({
  imports: [AlertCommentsModule, AlertSolvedModule],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsRepository],
})
export class LegacyAlertsModule {}
```

- [ ] **Step 2: Inject AlertSolvedService and add filtering helpers to AlertsService**

Edit `apps/backend/src/modules/legacy/alerts/alerts.service.ts`:

Add import at top:

```typescript
import { AlertSolvedService } from '../../alertSolved/alertSolved.service';
```

Update constructor:

```typescript
constructor(
  private readonly alertsRepo: AlertsRepository,
  private readonly alertCommentsRepo: AlertCommentsRepository,
  private readonly alertSolvedService: AlertSolvedService,
) {}
```

Add private helpers after `mergeCommentCounts`:

```typescript
private async getSolvedKeys(): Promise<Set<string>> {
  const solved = await this.alertSolvedService.getSolvedAlerts('', true);
  return new Set(
    solved.map((s) => `${s.partidaId}-${s.anio}-${s.indice}`),
  );
}

private applySolvedFilter<
  T extends { partidaId: number; anio: number; indice: number },
>(dtos: T[], solvedKeys: Set<string>): T[] {
  return dtos.filter(
    (d) => !solvedKeys.has(`${d.partidaId}-${d.anio}-${d.indice}`),
  );
}
```

- [ ] **Step 3: Update getSiembraRetrasada**

```typescript
async getSiembraRetrasada(): Promise<SiembraRetrasadaDto[]> {
  const rows = await this.alertsRepo.findSiembraRetrasada();
  const dtos = rows.map((row) => this.mapSiembraRetrasada(row));
  const withCounts = await this.mergeCommentCounts(dtos, 'SIEMBRA_RETRASADA');
  const solvedKeys = await this.getSolvedKeys();
  return this.applySolvedFilter(withCounts, solvedKeys);
}
```

- [ ] **Step 4: Update getFaltaGerminacion**

```typescript
async getFaltaGerminacion(): Promise<FaltaGerminacionDto[]> {
  const rows = await this.alertsRepo.findFaltaGerminacion();
  const dtos = rows.map((row) => this.mapFaltaGerminacion(row));
  const withCounts = await this.mergeCommentCounts(dtos, 'FALTA_GERMINACION');
  const solvedKeys = await this.getSolvedKeys();
  return this.applySolvedFilter(withCounts, solvedKeys);
}
```

- [ ] **Step 5: Update getFaltantePlantas**

```typescript
async getFaltantePlantas(): Promise<FaltantePlantasDto[]> {
  const rows = await this.alertsRepo.findFaltantePlantas();
  const dtos = rows.map((row) => this.mapFaltantePlantas(row));
  const withCounts = await this.mergeCommentCounts(dtos, 'FALTANTE_PLANTAS');
  const solvedKeys = await this.getSolvedKeys();
  return this.applySolvedFilter(withCounts, solvedKeys);
}
```

- [ ] **Step 6: Update getFaltaPreExpedicion**

```typescript
async getFaltaPreExpedicion(): Promise<FaltaPreExpedicionDto[]> {
  const rows = await this.alertsRepo.findFaltaPreExpedicion();
  const dtos = rows.map((row) => this.mapFaltaPreExpedicion(row));
  const withCounts = await this.mergeCommentCounts(dtos, 'FALTA_PRE_EXPEDICION');
  const solvedKeys = await this.getSolvedKeys();
  return this.applySolvedFilter(withCounts, solvedKeys);
}
```

- [ ] **Step 7: Run tests to verify they PASS**

Run: `pnpm --filter backend test -- --testPathPattern="alerts.service.spec"`
Expected: PASS (all existing + new tests)

- [ ] **Step 8: Run type check**

Run: `pnpm --filter backend type-check`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add apps/backend/src/modules/legacy/alerts/alerts.module.ts apps/backend/src/modules/legacy/alerts/alerts.service.ts
git commit -m "feat(alerts): filter solved alerts from legacy query results"
```

---

### Task 4: Update frontend query invalidation

**Files:**
- Modify: `apps/frontend/src/lib/query-invalidation-map.ts`

**Interfaces:**
- Consumes: None (standalone change)
- Produces: `createAlertSolved` mutation now also invalidates alert queries

- [ ] **Step 1: Add alertsQueryKeys to createAlertSolved entry**

Edit `apps/frontend/src/lib/query-invalidation-map.ts`. Find the `createAlertSolved` entry and update it:

```typescript
createAlertSolved: {
  queries: () => [
    alertsSolvedQueryKeys.all(),
    alertsQueryKeys.all(),
  ],
},
```

- [ ] **Step 2: Run lint**

Run: `pnpm --filter frontend lint`
Expected: PASS

- [ ] **Step 3: Run type check**

Run: `pnpm --filter frontend type-check`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/lib/query-invalidation-map.ts
git commit -m "fix(alerts): refetch alert lists after marking alert as solved"
```

---

### Task 5: Final verification

- [ ] **Step 1: Run full lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 2: Run full type check**

Run: `pnpm type-check`
Expected: PASS

- [ ] **Step 3: Run all backend tests**

Run: `pnpm --filter backend test`
Expected: PASS

- [ ] **Step 4: Manual smoke test**

1. Start dev: `pnpm dev`
2. Navigate to alerts dashboard
3. Open an alert, click "Marcar alerta como resuelta"
4. Verify the alert disappears from the table
5. Verify the backend returns filtered results (check network tab)
