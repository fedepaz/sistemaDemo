# Design: Filter Solved Alerts from Legacy Queries

**Date:** 2026-08-13
**Status:** Approved
**Scope:** Backend service-layer filtering + frontend cache invalidation

## Problem

The "Mark alert as solved" feature creates records in the `alerts_solved` Prisma table, but the legacy alert endpoints (`/l-alerts/*`) still return those alerts. Solved alerts should be filtered out of the response without modifying the legacy MySQL database.

## Constraints

- Legacy database (MySQL `partidas`/`articulo` tables) must not be modified.
- Filtering happens in the NestJS backend, not the frontend.
- Each alert is identified by the composite key `(partidaId, anio, indice)`.
- Solved alerts are global — once solved, hidden from all users.
- Undo (soft-delete solved) is out of scope for now.

## Approach: Service-Layer Filtering

Import `AlertSolvedModule` into `LegacyAlertsModule`. Inject `AlertSolvedService` into `AlertsService`. Each `get*()` method fetches the solved keys set, then filters after mapping and comment count merge.

This follows the existing pattern: `AlertCommentsModule` is already imported into `LegacyAlertsModule` for comment count merging.

## Changes

### 1. Backend: AlertSolvedRepository — `returnAll` parameter

**File:** `apps/backend/src/modules/alertSolved/repositories/alertsSolved.repository.ts`

Add an optional `returnAll` parameter to `findAllAlertsSolved`:

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
  // ... existing dev-account filtering logic
}
```

When `returnAll = true`, bypasses user-based filtering and returns all solved alert records. Used for global filtering purposes.

### 2. Backend: AlertSolvedService — pass through `returnAll`

**File:** `apps/backend/src/modules/alertSolved/alertSolved.service.ts`

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

### 3. Backend: LegacyAlertsModule — import AlertSolvedModule

**File:** `apps/backend/src/modules/legacy/alerts/alerts.module.ts`

```typescript
@Module({
  imports: [AlertCommentsModule, AlertSolvedModule],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsRepository],
})
export class LegacyAlertsModule {}
```

### 4. Backend: AlertsService — filtering logic

**File:** `apps/backend/src/modules/legacy/alerts/alerts.service.ts`

Add `AlertSolvedService` to constructor:

```typescript
constructor(
  private readonly alertsRepo: AlertsRepository,
  private readonly alertCommentsRepo: AlertCommentsRepository,
  private readonly alertSolvedService: AlertSolvedService,
) {}
```

Add private helpers:

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

Update each `get*()` method to filter after mapping + comment merge:

```typescript
async getSiembraRetrasada(): Promise<SiembraRetrasadaDto[]> {
  const rows = await this.alertsRepo.findSiembraRetrasada();
  const dtos = rows.map((row) => this.mapSiembraRetrasada(row));
  const withCounts = await this.mergeCommentCounts(dtos, 'SIEMBRA_RETRASADA');
  const solvedKeys = await this.getSolvedKeys();
  return this.applySolvedFilter(withCounts, solvedKeys);
}
```

Same pattern for `getFaltaGerminacion`, `getFaltantePlantas`, `getFaltaPreExpedicion`.

### 5. Frontend: Query invalidation

**File:** `apps/frontend/src/lib/query-invalidation-map.ts`

Update the `createAlertSolved` entry to also invalidate alert queries:

```typescript
createAlertSolved: {
  queries: () => [
    alertsSolvedQueryKeys.all(),
    alertsQueryKeys.all(),  // invalidates all 4 alert type queries
  ],
},
```

React Query invalidates all keys starting with `["alerts"]`, which includes `["alerts", "siembra-retrasada"]`, `["alerts", "falta-germinacion"]`, etc.

## Data Flow

```
User clicks "Marcar alerta como resuelta"
  → POST /alert-solved (creates record in alerts_solved table)
  → Frontend: createAlertSolved mutation onSuccess
    → Invalidates alertsSolved + alerts queries
    → Alerts refetch triggers GET /l-alerts/{type}
      → AlertsService.get*()
        → Fetches from legacy MySQL (unchanged)
        → Maps to DTOs
        → Merges comment counts
        → Fetches solved keys via AlertSolvedService.getSolvedAlerts('', true)
        → Filters out solved alerts
        → Returns filtered DTOs
    → Table updates, solved alert disappears
```

## Files Modified

| File | Change |
|------|--------|
| `apps/backend/src/modules/alertSolved/repositories/alertsSolved.repository.ts` | Add `returnAll` param |
| `apps/backend/src/modules/alertSolved/alertSolved.service.ts` | Pass through `returnAll` |
| `apps/backend/src/modules/legacy/alerts/alerts.module.ts` | Import `AlertSolvedModule` |
| `apps/backend/src/modules/legacy/alerts/alerts.service.ts` | Inject `AlertSolvedService`, add filtering helpers, update 4 `get*()` methods |
| `apps/frontend/src/lib/query-invalidation-map.ts` | Add `alertsQueryKeys.all()` to `createAlertSolved` |

## Performance Note

Each `get*()` method calls `getSolvedKeys()` independently. When all 4 alert types are fetched (e.g., on the dashboard), this results in 4 identical DB queries for solved alerts. This is acceptable because:

- The `alerts_solved` table is small (manual solves, not automated).
- React Query deduplicates concurrent requests with the same query key on the frontend.
- A future optimization can fetch solved keys once per request and pass them through, but is not needed now.

## What's NOT in scope

- Undo/soft-delete for solved alerts (future feature)
- New frontend components or pages
- Changes to legacy MySQL queries
- Changes to alert comment functionality
- New API endpoints (existing GET/POST on `/alert-solved` are sufficient)
