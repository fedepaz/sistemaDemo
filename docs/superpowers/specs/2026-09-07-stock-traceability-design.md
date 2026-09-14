# Stock Traceability Columns for SiembraPartidas

**Date:** 2026-09-07
**Status:** Approved

## Problem

When `asignarSiembra` runs, it calls `updateStock` on the legacy database and then creates a `siembraPartidas` record. However, the siembra record has no visibility into what the stock values were before or after the update. If a user enters an incorrect value (e.g., 15000 instead of 1500), the system processes it correctly but there is no way to trace where the error occurred.

## Goal

Store a full stock snapshot (before and after update) in the `siembraPartidas` table for traceability and debugging.

## Design

### New Columns (6 total, all nullable)

Added to `SiembraPartidas` Prisma model:

| Column | Type | Description |
|--------|------|-------------|
| `stockLote` | `Int?` | Batch number |
| `stockAnio` | `Int?` | Year |
| `stockEntradasAntes` | `Decimal? @db.Decimal(12,2)` | Total entries before stock update |
| `stockSalidasAntes` | `Decimal? @db.Decimal(12,2)` | Total exits before stock update |
| `stockEntradasDespues` | `Decimal? @db.Decimal(12,2)` | Total entries after stock update |
| `stockSalidasDespues` | `Decimal? @db.Decimal(12,2)` | Total exits after stock update |

Nullable because existing records will not have this data.

### Stock Repository Changes

`updateStock` changes return type from `Promise<void>` to:

```typescript
Promise<{
  entradasAntes: number;
  salidasAntes: number;
  entradasDespues: number;
  salidasDespues: number;
}>
```

Internally:
1. Query `stockTotal(lote, anio, item)` to get current totals (antes)
2. Write to `st_sem_item` and `st_sem` (same as now)
3. Return before and after values

### Partidas Service Changes

In `asignarSiembra` (inside the `$transaction`):

1. Call `updateStock(lote, anio, item)` and capture the returned snapshot
2. Pass stock fields to `createSiembraPartida`:

```typescript
const stockSnapshot = await this.legacyStockService.updateStock(
  data.lote, data.anio, data.item,
);

await this.siembraPartidaService.createSiembraPartida(
  {
    ...newSiembraData,
    stockLote: data.lote,
    stockAnio: data.anio,
    stockEntradasAntes: stockSnapshot.entradasAntes,
    stockSalidasAntes: stockSnapshot.salidasAntes,
    stockEntradasDespues: stockSnapshot.entradasDespues,
    stockSalidasDespues: stockSnapshot.salidasDespues,
  },
  requesterId,
);
```

### Shared Schema Changes

**`CreateSiembraPartidaSchema`** adds 6 optional fields:

```typescript
stockLote: z.number().optional(),
stockAnio: z.number().optional(),
stockEntradasAntes: z.number().optional(),
stockSalidasAntes: z.number().optional(),
stockEntradasDespues: z.number().optional(),
stockSalidasDespues: z.number().optional(),
```

**`SiembraPartidaSchema`** adds the same 6 fields for GET responses.

### SiembraPartidas Service and Repository

- `createSiembraPartida` passes the 6 new fields to Prisma create
- `mapToDto` maps them to the response DTO

### Migration

Prisma migration adding the 6 columns to `siembra_partdas` table.

## Files to Modify

1. `apps/backend/prisma/schema/siembraPartidas.prisma` - add columns
2. `apps/backend/src/modules/legacy/stock/repositories/stock.repository.ts` - return values from updateStock
3. `apps/backend/src/modules/legacy/stock/stock.service.ts` - update return type
4. `apps/backend/src/modules/legacy/partidas/partidas.service.ts` - capture and pass stock data
5. `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts` - accept and map new fields
6. `apps/backend/src/modules/siembraPartidas/repositories/siembraPartidas.repository.ts` - pass new fields to create
7. `packages/shared/src/schemas/siembraPartida.schema.ts` - add fields to DTOs
8. Prisma migration file
