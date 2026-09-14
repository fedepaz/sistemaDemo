# Stock Traceability Columns Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 6 stock traceability columns to `siembraPartidas` to capture before/after stock values during siembra creation.

**Architecture:** Modify `updateStock` to return stock snapshot, thread it through `partidas.service.ts` into `createSiembraPartida`, and store in new Prisma columns.

**Tech Stack:** Prisma, NestJS, Zod, MariaDB (legacy), MySQL2

## Global Constraints

- All DB columns are nullable (existing records have no stock data)
- `Decimal(12,2)` for stock amounts, `Int` for lote/anio
- Conventional Commits enforced (commitlint)
- TDD: tests before feature code
- Run `pnpm lint && pnpm type-check && pnpm test` before committing

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `apps/backend/prisma/schema/siembraPartidas.prisma` | Modify | Add 6 columns |
| `apps/backend/src/modules/legacy/stock/interfaces/stock.interface.ts` | Modify | Add `StockSnapshot` interface |
| `apps/backend/src/modules/legacy/stock/repositories/stock.repository.ts` | Modify | Return snapshot from `updateStock` |
| `apps/backend/src/modules/legacy/stock/stock.service.ts` | Modify | Update return type |
| `apps/backend/src/modules/legacy/partidas/partidas.service.ts` | Modify | Capture and pass stock data |
| `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts` | Modify | Accept new fields in `createSiembraPartida` and `mapToDto` |
| `apps/backend/src/modules/siembraPartidas/repositories/siembraPartidas.repository.ts` | Modify | Pass new fields to Prisma create |
| `packages/shared/src/schemas/siembraPartida.schema.ts` | Modify | Add fields to DTOs |
| `apps/backend/prisma/migrations/` | Create | Migration for new columns |

---

### Task 1: Add Prisma Schema Columns

**Files:**
- Modify: `apps/backend/prisma/schema/siembraPartidas.prisma`

**Interfaces:**
- Consumes: None (first task)
- Produces: Updated Prisma model with 6 new nullable columns

- [ ] **Step 1: Add columns to schema**

Edit `apps/backend/prisma/schema/siembraPartidas.prisma`. Add after line 10 (after `tratamientoSemilla`):

```prisma
  // Stock traceability
  stockLote            Int?
  stockAnio            Int?
  stockEntradasAntes   Decimal? @db.Decimal(12,2)
  stockSalidasAntes    Decimal? @db.Decimal(12,2)
  stockEntradasDespues Decimal? @db.Decimal(12,2)
  stockSalidasDespues  Decimal? @db.Decimal(12,2)
```

- [ ] **Step 2: Generate Prisma client**

Run: `pnpm --filter backend exec prisma generate`
Expected: Prisma client regenerated with new fields

- [ ] **Step 3: Create migration**

Run: `pnpm --filter backend exec prisma migrate dev --name add-stock-traceability`
Expected: Migration file created in `prisma/migrations/`

- [ ] **Step 4: Commit**

```bash
git add apps/backend/prisma/schema/siembraPartidas.prisma apps/backend/prisma/migrations/
git commit -m "feat(db): add stock traceability columns to siembraPartidas"
```

---

### Task 2: Add StockSnapshot Interface

**Files:**
- Modify: `apps/backend/src/modules/legacy/stock/interfaces/stock.interface.ts`

**Interfaces:**
- Consumes: None
- Produces: `StockSnapshot` interface used by repository and service

- [ ] **Step 1: Add interface**

Edit `apps/backend/src/modules/legacy/stock/interfaces/stock.interface.ts`. Add after the `StockTotal` interface:

```typescript
export interface StockSnapshot {
  entradasAntes: number;
  salidasAntes: number;
  entradasDespues: number;
  salidasDespues: number;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/backend/src/modules/legacy/stock/interfaces/stock.interface.ts
git commit -m "feat(stock): add StockSnapshot interface"
```

---

### Task 3: Update StockRepository.updateStock Return Type

**Files:**
- Modify: `apps/backend/src/modules/legacy/stock/repositories/stock.repository.ts`

**Interfaces:**
- Consumes: `StockSnapshot` from Task 2
- Produces: `updateStock` returns `Promise<StockSnapshot>`

- [ ] **Step 1: Update imports**

Edit `apps/backend/src/modules/legacy/stock/repositories/stock.repository.ts`. Change the import on line 5:

```typescript
import { StockSnapshot, StockTotal } from '../interfaces/stock.interface';
```

- [ ] **Step 2: Update updateStock method**

Replace the entire `updateStock` method (lines 47-71):

```typescript
  async updateStock(
    lote: number,
    anio: number,
    item: number,
  ): Promise<StockSnapshot> {
    const stockTotal = await this.stockTotal(lote, anio, item);
    const entradasAntes = Number(stockTotal[0].total_entradas);
    const salidasAntes = Number(stockTotal[0].total_salidas);

    const entradasDespues = entradasAntes;
    const salidasDespues = salidasAntes;

    const updateItemSql = `
        UPDATE st_sem_item
        SET entrada = ?, salida = ?
        WHERE lote = ? AND ano = ? AND item = ?
      `;
    const updateSemSql = `
          UPDATE st_sem
          SET entrada = ?, salida = ?
          WHERE lote = ? AND ano = ?
        `;
    await this.legacyDb.transaction(async (conn) => {
      await conn.query(updateItemSql, [
        entradasDespues,
        salidasDespues,
        lote,
        anio,
        item,
      ]);
      await conn.query(updateSemSql, [
        entradasDespues,
        salidasDespues,
        lote,
        anio,
      ]);
    });

    return {
      entradasAntes,
      salidasAntes,
      entradasDespues,
      salidasDespues,
    };
  }
```

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/legacy/stock/repositories/stock.repository.ts
git commit -m "feat(stock): return StockSnapshot from updateStock"
```

---

### Task 4: Update LegacyStockService Return Type

**Files:**
- Modify: `apps/backend/src/modules/legacy/stock/stock.service.ts`

**Interfaces:**
- Consumes: `StockSnapshot` from Task 2
- Produces: `updateStock` returns `Promise<StockSnapshot>`

- [ ] **Step 1: Update imports**

Edit `apps/backend/src/modules/legacy/stock/stock.service.ts`. Change line 5:

```typescript
import { StockSnapshot, StockTotal } from './interfaces/stock.interface';
```

- [ ] **Step 2: Update updateStock method**

Replace the `updateStock` method (lines 19-21):

```typescript
  async updateStock(
    lote: number,
    anio: number,
    item: number,
  ): Promise<StockSnapshot> {
    return this.repository.updateStock(lote, anio, item);
  }
```

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/legacy/stock/stock.service.ts
git commit -m "feat(stock): update LegacyStockService.updateStock return type"
```

---

### Task 5: Update Shared Schemas (CreateSiembraPartidaSchema + SiembraPartidaSchema)

**Files:**
- Modify: `packages/shared/src/schemas/siembraPartida.schema.ts`

**Interfaces:**
- Consumes: None
- Produces: Updated Zod schemas with 6 optional stock fields

- [ ] **Step 1: Add fields to CreateSiembraPartidaSchema**

Edit `packages/shared/src/schemas/siembraPartida.schema.ts`. Add after line 70 (after `mezclaId`):

```typescript
  // Stock traceability
  stockLote: z.number().optional(),
  stockAnio: z.number().optional(),
  stockEntradasAntes: z.number().optional(),
  stockSalidasAntes: z.number().optional(),
  stockEntradasDespues: z.number().optional(),
  stockSalidasDespues: z.number().optional(),
```

- [ ] **Step 2: Add fields to SiembraPartidaSchema**

Edit `packages/shared/src/schemas/siembraPartida.schema.ts`. Add after line 41 (after `detalleExtendido`):

```typescript
  // Stock traceability
  stockLote: z.number().optional(),
  stockAnio: z.number().optional(),
  stockEntradasAntes: z.number().optional(),
  stockSalidasAntes: z.number().optional(),
  stockEntradasDespues: z.number().optional(),
  stockSalidasDespues: z.number().optional(),
```

- [ ] **Step 3: Build shared package**

Run: `pnpm --filter @vivero/shared build`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add packages/shared/src/schemas/siembraPartida.schema.ts
git commit -m "feat(shared): add stock traceability fields to siembraPartida schemas"
```

---

### Task 6: Update SiembraPartidasRepository.createSiembraPartida

**Files:**
- Modify: `apps/backend/src/modules/siembraPartidas/repositories/siembraPartidas.repository.ts`

**Interfaces:**
- Consumes: Prisma model from Task 1, `CreateSiembraPartidaDto` from Task 5
- Produces: `createSiembraPartida` accepts stock fields

- [ ] **Step 1: Update createSiembraPartida method**

The current method already spreads `...data` into Prisma create (line 29). Since the Prisma model now has the new columns, the spread will automatically include them. **No code change needed** — the existing `...data` spread handles it.

- [ ] **Step 2: Commit (no-op, verify only)**

Verify by running type-check:
Run: `pnpm --filter backend type-check`
Expected: No errors

---

### Task 7: Update SiembraPartidasService.createSiembraPartida and mapToDto

**Files:**
- Modify: `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts`

**Interfaces:**
- Consumes: Updated `CreateSiembraPartidaDto` from Task 5
- Produces: `createSiembraPartida` passes stock fields, `mapToDto` returns them

- [ ] **Step 1: Update createSiembraPartida**

Edit `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts`. In `createSiembraPartida` (starting line 198), update the `this.repo.createSiembraPartida` call to include stock fields. Replace lines 204-222:

```typescript
    const row = await this.repo.createSiembraPartida({
      partidaId: data.partidaId,
      anio: data.anio,
      indice: data.indice,
      metodoMaquina: data.metodoMaquina,
      presionSemilla: data.presionSemilla,
      profundidadSemilla: data.profundidadSemilla,
      tratamientoSemilla: data.tratamientoSemilla,
      stockLote: data.stockLote,
      stockAnio: data.stockAnio,
      stockEntradasAntes: data.stockEntradasAntes,
      stockSalidasAntes: data.stockSalidasAntes,
      stockEntradasDespues: data.stockEntradasDespues,
      stockSalidasDespues: data.stockSalidasDespues,
      mezcla: {
        connect: {
          id: mezclaId,
        },
      },
      user: {
        connect: {
          id: requesterId,
        },
      },
    });
```

- [ ] **Step 2: Update mapToDto**

Edit `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts`. In `mapToDto`, add after line 139 (after `detalleExtendido`):

```typescript
      // Stock traceability
      stockLote: row.stockLote ?? undefined,
      stockAnio: row.stockAnio ?? undefined,
      stockEntradasAntes: row.stockEntradasAntes
        ? Number(row.stockEntradasAntes)
        : undefined,
      stockSalidasAntes: row.stockSalidasAntes
        ? Number(row.stockSalidasAntes)
        : undefined,
      stockEntradasDespues: row.stockEntradasDespues
        ? Number(row.stockEntradasDespues)
        : undefined,
      stockSalidasDespues: row.stockSalidasDespues
        ? Number(row.stockSalidasDespues)
        : undefined,
```

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts
git commit -m "feat(siembraPartidas): accept and map stock traceability fields"
```

---

### Task 8: Update PartidasService.asignarSiembra

**Files:**
- Modify: `apps/backend/src/modules/legacy/partidas/partidas.service.ts`

**Interfaces:**
- Consumes: `LegacyStockService.updateStock` returns `StockSnapshot` from Task 4
- Produces: Stock snapshot passed to `createSiembraPartida`

- [ ] **Step 1: Update the transaction block**

Edit `apps/backend/src/modules/legacy/partidas/partidas.service.ts`. Replace lines 134-160 (the `$transaction` block):

```typescript
    await this.prisma.$transaction(async () => {
      const stockSnapshot = await this.legacyStockService.updateStock(
        data.lote,
        data.anio,
        data.item,
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

      await this.partidasRepository.asignarSiembra(legacyData);

      if (data.startTime && data.endTime) {
        await this.taskShiftsService.createTaskShift(
          {
            entityId: data.entityId,
            partidaId: data.partidaId,
            anio: data.anio,
            indice: data.indice,
            startTime: data.startTime,
            endTime: data.endTime,
            employeeUserIds: data.employeeUserIds ?? [],
          },
          requesterId,
        );
      }
    });
```

- [ ] **Step 2: Commit**

```bash
git add apps/backend/src/modules/legacy/partidas/partidas.service.ts
git commit -m "feat(partidas): capture and pass stock snapshot to siembraPartida"
```

---

### Task 9: Verify and Final Check

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: All previous tasks
- Produces: Passing lint, type-check, and tests

- [ ] **Step 1: Build shared package**

Run: `pnpm --filter @vivero/shared build`
Expected: No errors

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: No errors

- [ ] **Step 3: Run type-check**

Run: `pnpm type-check`
Expected: No errors

- [ ] **Step 4: Run tests**

Run: `pnpm test`
Expected: All tests pass

- [ ] **Step 5: Final commit if needed**

If any fixes were needed, commit them:

```bash
git add -A
git commit -m "fix: stock traceability review fixes"
```
