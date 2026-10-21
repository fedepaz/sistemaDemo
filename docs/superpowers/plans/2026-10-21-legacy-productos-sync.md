# Legacy Productos Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every legacy producto (`articulo WHERE hai='O' AND tipo='PF'`) must exist as a Prisma `Producto` row linked by `legacyCodigo`, so `GET /productos` serves a synced catalog and formulas keep working with zero frontend changes.

**Architecture:** A new `LegacyProductoSyncService` in the productos module runs at the top of `ProductosService.getAllProductos()`: it fetches the legacy list (one query, deduped by `codigo`), diffs it against all Prisma productos, and applies creates/adopts/renames inside a single transaction — only when there is drift. Any legacy failure is swallowed with a log so reads always serve the Prisma list.

**Tech Stack:** NestJS 11, Prisma 7 (MySQL/MariaDB), Jest, pnpm workspace.

## Global Constraints

- **NO COMMITS AT ANY POINT.** The user reviews all changes before anything is committed. This overrides any commit step (there are none) — leave the working tree dirty for inspection.
- **The user executes the Prisma migration** (Task 6 hands off exact commands). Do not run `db:migrate*` yourself. `prisma generate` (types only) IS executed by the implementer.
- Legacy query is exactly `WHERE hai = 'O' AND tipo = 'PF'` (verbatim; local dev has zero matching rows — expected and irrelevant).
- No changes to `ProductoDto`, shared schemas, the frontend, or the formula module.
- Design doc: `docs/superpowers/specs/2026-10-21-legacy-productos-sync-design.md` (source of truth for decisions).
- Backend unit tests: `pnpm --filter backend exec jest <path> --runInBand`
- Verification order: `pnpm lint && pnpm type-check && pnpm test` then `pnpm --filter backend test:integration`
- 4 pre-existing frontend lint warnings are unrelated and acceptable.

---

### Task 1: Schema field + client regeneration

**Files:**
- Modify: `apps/backend/prisma/schema/productos.prisma:1-8`
- (DB migration itself → Task 6, user-executed)

**Interfaces:**
- Produces: Prisma `Producto` model type now includes `legacyCodigo: string | null`. Task 3's `findMany({ select: { legacyCodigo: true } })` and `create({ data: { legacyCodigo } })` depend on this.

- [ ] **Step 1: Add the field to the schema**

In `apps/backend/prisma/schema/productos.prisma`, add `legacyCodigo` immediately after `nombre`:

```prisma
model Producto {
    id          String @id @default(cuid())
    nombre      String @unique
    legacyCodigo String? @unique @db.VarChar(50)

  isActive    Boolean  @default(true)
```

(Leave the rest of the model untouched, including its existing indentation quirks.)

- [ ] **Step 2: Regenerate the client (types only — no DB touched)**

Run: `pnpm --filter backend exec prisma generate`
Expected: `Generated Prisma client` (or similar success output); no error.

- [ ] **Step 3: Verify backend still compiles**

Run: `pnpm --filter backend exec tsc --noEmit`
Expected: exit 0, no output.

---

### Task 2: Fix legacy producto queries (`hai='0'` → `hai='O'`)

The `/l-sustrato/productos` endpoints (kept for API consistency; not consumed by the frontend) currently query a value that matches nothing. No TDD here: the legacy module has no test harness and the spec explicitly scopes endpoint tests out.

**Files:**
- Modify: `apps/backend/src/modules/legacy/sustrato/repositories/sustrato.repository.ts:36-44`

**Interfaces:**
- Produces: `findAllProductos()` returns rows for `hai='O' AND tipo='PF'` ordered by `codigo` — Task 3 consumes this ordering for deterministic dedupe.

- [ ] **Step 1: Update the list query**

Replace `findAllProductos` body with (adds `ORDER BY codigo`, params `['O', 'PF']`):

```ts
  async findAllProductos(): Promise<LegacyProducto[]> {
    const rows = await this.legacyDb.query<LegacyProducto[]>(
      'SELECT codigo, nombre, unidad FROM articulo WHERE hai = ? AND tipo = ? ORDER BY codigo',
      ['O', 'PF'],
    );
    return rows.map((row) => ({
      ...row,
      nombre: row.nombre.trim(),
      unidad: row.unidad.trim(),
    }));
  }
```

- [ ] **Step 2: Update the single-row query**

In `findOneProducto`, change the params from `['0', 'PF', codigo]` to `['O', 'PF', codigo]` (SQL text unchanged apart from nothing — the `WHERE hai = ?` placeholder stays):

```ts
      'SELECT codigo, nombre, unidad FROM articulo WHERE hai = ? AND tipo = ? AND codigo = ?',
      ['O', 'PF', codigo],
```

- [ ] **Step 3: Verify compile**

Run: `pnpm --filter backend exec tsc --noEmit`
Expected: exit 0.

---

### Task 3: Sync service — happy paths (TDD)

**Files:**
- Create: `apps/backend/src/modules/productos/__tests__/legacy-producto-sync.service.spec.ts`
- Create: `apps/backend/src/modules/productos/legacy-producto-sync.service.ts`

**Interfaces:**
- Consumes: `LegacySustratoService.getAllProductos(): Promise<LegacyProductoDto[]>` (from Task 2), Prisma `Producto.legacyCodigo` (Task 1), `PrismaService`.
- Produces: `LegacyProductoSyncService` with constructor `(prisma: PrismaService, legacySustratoService: LegacySustratoService)` and `sync(): Promise<void>` — Task 5 wires it into `ProductosService`; Task 4 extends it.

- [ ] **Step 1: Write the failing tests (happy paths)**

Create `apps/backend/src/modules/productos/__tests__/legacy-producto-sync.service.spec.ts`:

```ts
// src/modules/productos/__tests__/legacy-producto-sync.service.spec.ts
import { LegacyProductoSyncService } from '../legacy-producto-sync.service';

describe('LegacyProductoSyncService', () => {
  let service: LegacyProductoSyncService;
  let prismaMock: {
    producto: { findMany: jest.Mock; update: jest.Mock; create: jest.Mock };
    $transaction: jest.Mock;
  };
  const legacyMock = { getAllProductos: jest.fn() };

  const legacyItem = (codigo: string, nombre: string) => ({
    codigo,
    nombre,
    unidad: 'u',
  });

  const prismaRow = (
    id: string,
    nombre: string,
    legacyCodigo: string | null = null,
    deletedAt: Date | null = null,
  ) => ({ id, nombre, legacyCodigo, deletedAt });

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock = {
      producto: {
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockResolvedValue({}),
        create: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    };
    service = new LegacyProductoSyncService(
      prismaMock as never,
      legacyMock as never,
    );
  });

  describe('happy paths', () => {
    it('creates a Prisma row for an unmatched legacy producto', async () => {
      legacyMock.getAllProductos.mockResolvedValue([
        legacyItem('L001', 'Perlita'),
      ]);

      await service.sync();

      expect(prismaMock.producto.create).toHaveBeenCalledWith({
        data: { nombre: 'Perlita', legacyCodigo: 'L001' },
      });
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it('adopts an existing active unlinked row by nombre', async () => {
      legacyMock.getAllProductos.mockResolvedValue([
        legacyItem('L001', 'Perlita'),
      ]);
      prismaMock.producto.findMany.mockResolvedValue([
        prismaRow('p1', 'Perlita'),
      ]);

      await service.sync();

      expect(prismaMock.producto.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { legacyCodigo: 'L001' },
      });
      expect(prismaMock.producto.create).not.toHaveBeenCalled();
    });

    it('deduplicates legacy rows sharing a codigo', async () => {
      legacyMock.getAllProductos.mockResolvedValue([
        legacyItem('L001', 'Perlita'),
        legacyItem('L001', 'Perlita'),
      ]);

      await service.sync();

      expect(prismaMock.producto.create).toHaveBeenCalledTimes(1);
    });

    it('does nothing when the legacy list is empty', async () => {
      legacyMock.getAllProductos.mockResolvedValue([]);

      await service.sync();

      expect(prismaMock.producto.findMany).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('writes nothing when linked rows already match (steady state)', async () => {
      legacyMock.getAllProductos.mockResolvedValue([
        legacyItem('L001', 'Perlita'),
      ]);
      prismaMock.producto.findMany.mockResolvedValue([
        prismaRow('p1', 'Perlita', 'L001'),
      ]);

      await service.sync();

      expect(prismaMock.producto.create).not.toHaveBeenCalled();
      expect(prismaMock.producto.update).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter backend exec jest src/modules/productos/__tests__/legacy-producto-sync.service.spec.ts --runInBand`
Expected: FAIL — `Cannot find module '../legacy-producto-sync.service'` (suite fails to run).

- [ ] **Step 3: Write the initial implementation**

Create `apps/backend/src/modules/productos/legacy-producto-sync.service.ts`:

```ts
// src/modules/productos/legacy-producto-sync.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { LegacySustratoService } from '../legacy/sustrato/sustrato.service';
import { LegacyProducto } from '../legacy/sustrato/interfaces/sustrato.interface';

@Injectable()
export class LegacyProductoSyncService {
  private readonly logger = new Logger(LegacyProductoSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly legacySustratoService: LegacySustratoService,
  ) {}

  async sync(): Promise<void> {
    try {
      const legacy = await this.legacySustratoService.getAllProductos();
      const legacyByCodigo = new Map<string, LegacyProducto>();
      for (const item of legacy) {
        if (!legacyByCodigo.has(item.codigo)) {
          legacyByCodigo.set(item.codigo, item);
        }
      }
      if (legacyByCodigo.size === 0) return;

      const rows = await this.prisma.producto.findMany({
        select: {
          id: true,
          nombre: true,
          legacyCodigo: true,
          deletedAt: true,
        },
      });

      const byLegacyCodigo = new Map<string, { id: string; nombre: string }>();
      const byNombre = new Map<
        string,
        { id: string; nombre: string; legacyCodigo: string | null; deletedAt: Date | null }
      >();
      for (const row of rows) {
        if (row.legacyCodigo) {
          byLegacyCodigo.set(row.legacyCodigo, { id: row.id, nombre: row.nombre });
        }
        if (!byNombre.has(row.nombre)) {
          byNombre.set(row.nombre, row);
        }
      }

      const ops: Prisma.PrismaPromise<unknown>[] = [];
      const takenNames = new Set<string>();

      for (const item of legacyByCodigo.values()) {
        const linked = byLegacyCodigo.get(item.codigo);
        if (linked) continue;

        const match = byNombre.get(item.nombre);
        if (match && match.deletedAt === null && !match.legacyCodigo) {
          ops.push(
            this.prisma.producto.update({
              where: { id: match.id },
              data: { legacyCodigo: item.codigo },
            }),
          );
          takenNames.add(item.nombre);
          continue;
        }
        ops.push(
          this.prisma.producto.create({
            data: { nombre: item.nombre, legacyCodigo: item.codigo },
          }),
        );
        takenNames.add(item.nombre);
      }

      if (ops.length > 0) {
        await this.prisma.$transaction(ops);
      }
    } catch (error) {
      this.logger.error(
        `Legacy producto sync failed: ${(error as Error).message}`,
      );
    }
  }
}
```

NOTE: `Prisma` must be imported for the `ops` typing — add to the imports:

```ts
import { Prisma } from '../../generated/prisma/client';
```

(This initial version intentionally lacks rename/skip/resilience-hardening branches — Task 4 adds them red-first. The legacy fetch is already inside the try/catch; Task 4's resilience test asserts no-throw on rejection, which this structure provides.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter backend exec jest src/modules/productos --runInBand`
Expected: the new spec passes (5 tests); existing productos specs still pass.

---

### Task 4: Sync service — renames, skips, resilience (TDD)

**Files:**
- Modify: `apps/backend/src/modules/productos/__tests__/legacy-producto-sync.service.spec.ts`
- Modify: `apps/backend/src/modules/productos/legacy-producto-sync.service.ts`

**Interfaces:**
- Produces: same `sync(): Promise<void>` — full algorithm per spec §Sync algorithm.

- [ ] **Step 1: Append the failing tests**

Append a new `describe` inside the outer `describe` (after the `happy paths` block; reuse `legacyItem`/`prismaRow`/`prismaMock` from Task 3):

```ts
  describe('renames, skips and resilience', () => {
    it('renames a linked row when the legacy name drifted', async () => {
      legacyMock.getAllProductos.mockResolvedValue([
        legacyItem('L001', 'Perlita Plus'),
      ]);
      prismaMock.producto.findMany.mockResolvedValue([
        prismaRow('p1', 'Perlita', 'L001'),
      ]);

      await service.sync();

      expect(prismaMock.producto.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { nombre: 'Perlita Plus' },
      });
    });

    it('skips the rename when the target name is taken by another row', async () => {
      legacyMock.getAllProductos.mockResolvedValue([
        legacyItem('L001', 'Perlita Plus'),
      ]);
      prismaMock.producto.findMany.mockResolvedValue([
        prismaRow('p1', 'Perlita', 'L001'),
        prismaRow('p2', 'Perlita Plus'),
      ]);

      await service.sync();

      expect(prismaMock.producto.update).not.toHaveBeenCalled();
      expect(prismaMock.producto.create).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('skips a soft-deleted name match without resurrecting or inserting', async () => {
      legacyMock.getAllProductos.mockResolvedValue([
        legacyItem('L001', 'Perlita'),
      ]);
      prismaMock.producto.findMany.mockResolvedValue([
        prismaRow('p1', 'Perlita', null, new Date('2026-01-01')),
      ]);

      await service.sync();

      expect(prismaMock.producto.update).not.toHaveBeenCalled();
      expect(prismaMock.producto.create).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('skips a second legacy producto whose name is already taken', async () => {
      legacyMock.getAllProductos.mockResolvedValue([
        legacyItem('L001', 'Perlita'),
        legacyItem('L002', 'Perlita'),
      ]);
      prismaMock.producto.findMany.mockResolvedValue([]);

      await service.sync();

      expect(prismaMock.producto.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.producto.update).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it('survives a legacy DB failure without throwing or writing', async () => {
      legacyMock.getAllProductos.mockRejectedValue(new Error('legacy down'));

      await expect(service.sync()).resolves.toBeUndefined();

      expect(prismaMock.producto.findMany).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('does not touch isActive/deletedAt when renaming', async () => {
      legacyMock.getAllProductos.mockResolvedValue([
        legacyItem('L001', 'Perlita Plus'),
      ]);
      prismaMock.producto.findMany.mockResolvedValue([
        prismaRow('p1', 'Perlita', 'L001'),
      ]);

      await service.sync();

      expect(prismaMock.producto.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { nombre: 'Perlita Plus' },
      });
      const dataArg = prismaMock.producto.update.mock.calls[0][0].data;
      expect(dataArg).not.toHaveProperty('isActive');
      expect(dataArg).not.toHaveProperty('deletedAt');
    });
  });
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `pnpm --filter backend exec jest src/modules/productos/__tests__/legacy-producto-sync.service.spec.ts --runInBand`
Expected: FAIL — rename test gets no `update` call (initial impl `continue`s on linked rows); soft-deleted test gets a `create` call; duplicate-name test gets 2 creates.

- [ ] **Step 3: Extend the implementation to the full algorithm**

Replace the `for (const item of legacyByCodigo.values())` loop and the try/catch structure in `legacy-producto-sync.service.ts` with:

```ts
      const ops: Prisma.PrismaPromise<unknown>[] = [];
      const takenNames = new Set<string>();

      for (const item of legacyByCodigo.values()) {
        const linked = byLegacyCodigo.get(item.codigo);
        if (linked) {
          if (linked.nombre !== item.nombre) {
            const target =
              byNombre.get(item.nombre) ?? undefined;
            const conflict =
              takenNames.has(item.nombre) ||
              (target !== undefined && target.id !== linked.id);
            if (conflict) {
              this.logger.warn(
                `Legacy producto ${item.codigo}: cannot rename to "${item.nombre}" (name taken); keeping "${linked.nombre}"`,
              );
            } else {
              ops.push(
                this.prisma.producto.update({
                  where: { id: linked.id },
                  data: { nombre: item.nombre },
                }),
              );
              takenNames.add(item.nombre);
            }
          }
          continue;
        }

        const match = byNombre.get(item.nombre);
        if (
          match &&
          match.deletedAt === null &&
          !match.legacyCodigo &&
          !takenNames.has(item.nombre)
        ) {
          ops.push(
            this.prisma.producto.update({
              where: { id: match.id },
              data: { legacyCodigo: item.codigo },
            }),
          );
          takenNames.add(item.nombre);
          continue;
        }
        if (match || takenNames.has(item.nombre)) {
          this.logger.warn(
            `Legacy producto ${item.codigo} ("${item.nombre}"): nombre unavailable (soft-deleted or already linked); skipped`,
          );
          continue;
        }
        ops.push(
          this.prisma.producto.create({
            data: { nombre: item.nombre, legacyCodigo: item.codigo },
          }),
        );
        takenNames.add(item.nombre);
      }

      if (ops.length > 0) {
        await this.prisma.$transaction(ops);
      }
    } catch (error) {
      this.logger.error(
        `Legacy producto sync failed: ${(error as Error).message}`,
      );
    }
  }
```

The `linked` map value and `byNombre` maps stay as built in Task 3 (make sure `byNombre`'s selected type includes `legacyCodigo` and `deletedAt` — already true). The rename branch never writes `isActive`/`deletedAt`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter backend exec jest src/modules/productos --runInBand`
Expected: all specs in the folder pass (happy paths 5 + new 6 + pre-existing productos specs).

---

### Task 5: Wiring into `GET /productos` + full verification

**Files:**
- Modify: `apps/backend/src/modules/productos/productos.module.ts`
- Modify: `apps/backend/src/modules/productos/productos.service.ts:14-25`
- Modify: `apps/backend/src/modules/productos/__tests__/productos.service.spec.ts`

**Interfaces:**
- Consumes: `LegacyProductoSyncService.sync(): Promise<void>` (Task 3/4).
- Produces: `GET /productos` runs the sync before reading (behavioral contract tested below).

- [ ] **Step 1: Write the failing test**

In `productos.service.spec.ts`: import `LegacyProductoSyncService`, add to the mock shape and providers, and add the ordering assertion.

(a) Top imports:

```ts
import { LegacyProductoSyncService } from '../legacy-producto-sync.service';
```

(b) Inside `beforeEach`, before `Test.createTestingModule`, create the mock:

```ts
    const legacySync = { sync: jest.fn().mockResolvedValue(undefined) };
```

(c) Providers array becomes:

```ts
      providers: [
        ProductosService,
        { provide: ProductosRepository, useValue: repo },
        { provide: LegacyProductoSyncService, useValue: legacySync },
      ],
```

(d) Add the new test in the `getAllProductos` describe:

```ts
    it('runs legacy sync before reading productos', async () => {
      repo.findAll.mockResolvedValue([]);

      await service.getAllProductos('user-1');

      expect(legacySync.sync).toHaveBeenCalledTimes(1);
      expect(legacySync.sync.mock.invocationCallOrder[0]).toBeLessThan(
        repo.findAll.mock.invocationCallOrder[0],
      );
    });
```

(Let TypeScript's existing compile of the spec catch the mock placement; `legacySync` must be declared before the testing module builds.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter backend exec jest src/modules/productos/__tests__/productos.service.spec.ts --runInBand`
Expected: FAIL — `Nest can't resolve dependencies of the ProductosService (..., LegacyProductoSyncService)` or the new test fails because the service doesn't call sync.

- [ ] **Step 3: Wire the module**

`apps/backend/src/modules/productos/productos.module.ts` — full file:

```ts
// src/modules/productos/productos.module.ts

import { Module } from '@nestjs/common';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { ProductosRepository } from './repositories/productos.repository';
import { LegacyProductoSyncService } from './legacy-producto-sync.service';
import { LegacySustratoModule } from '../legacy/sustrato/sustrato.module';

@Module({
  controllers: [ProductosController],
  providers: [
    ProductosService,
    ProductosRepository,
    LegacyProductoSyncService,
  ],
  imports: [LegacySustratoModule],
  exports: [ProductosService],
})
export class ProductosModule {}
```

- [ ] **Step 4: Call sync in the service**

In `productos.service.ts`: add import + constructor param + first line of `getAllProductos`:

```ts
import { LegacyProductoSyncService } from './legacy-producto-sync.service';
```

```ts
  constructor(
    private readonly repo: ProductosRepository,
    private readonly legacyProductoSync: LegacyProductoSyncService,
  ) {}
```

```ts
  async getAllProductos(requesterId: string): Promise<ProductoDto[]> {
    await this.legacyProductoSync.sync();
    const rows = await this.repo.findAll(requesterId);
```

No other method calls sync (single-read-path contract from the spec).

- [ ] **Step 5: Run the productos + formula suites**

Run: `pnpm --filter backend exec jest src/modules/productos src/modules/formula src/modules/siembraPartidas --runInBand`
Expected: all pass.

- [ ] **Step 6: Full verification**

Run: `pnpm lint && pnpm type-check && pnpm test`
Expected: exit 0 (4 pre-existing frontend warnings tolerated).

Run: `pnpm --filter backend test:integration`
Expected: all pass (119+).

- [ ] **Step 7: STOP — do not commit**

Leave the working tree dirty: the user reviews every change before any commit (Global Constraint). Report the changed-file list instead.

---

### Task 6: Migration handoff (USER-EXECUTED — do not run these yourself)

Hand this block to the user verbatim after Task 5 is green.

**Files:**
- Create: `apps/backend/prisma/migrations/<timestamp>_add_producto_legacy_codigo/migration.sql` (via command below)

- [ ] **Step 1: (user) Create the migration without applying**

```bash
pnpm --filter backend exec prisma migrate dev --create-only --name add_producto_legacy_codigo
```

- [ ] **Step 2: (user) Replace the generated SQL with**

```sql
-- Producto.legacyCodigo: optional unique link to the legacy articulo codigo.
-- Add nullable column (existing rows stay NULL) + unique index.

-- 1) Add nullable column
ALTER TABLE `Producto` ADD COLUMN `legacyCodigo` VARCHAR(50) NULL;

-- 2) Unique index (name matches Prisma convention)
CREATE UNIQUE INDEX `Producto_legacyCodigo_key` ON `Producto`(`legacyCodigo`);
```

- [ ] **Step 3: (user) Apply and verify**

```bash
pnpm --filter backend db:migrate:dev
pnpm --filter backend db:status
```

Expected: "Database schema is up to date!"

- [ ] **Step 4: (user) Smoke check**

```bash
curl -s http://localhost:3001/productos -H "Authorization: Bearer <token>" | head -c 400
```

Expected: JSON list; with local legacy having zero `hai='O' AND tipo='PF'` rows, no rows are created/linked locally — correct. On production, drift resolution happens on first read.

---

## Self-Review notes

- **Spec coverage:** schema+generate (T1), `hai='O'` fix (T2), sync algorithm happy paths (T3), renames/skips/resilience per spec edge-case list (T4), wiring + no-DTO-change contract (T5), user-run migration (T6), no-commits (Global Constraints + T5 Step 7).
- **Type consistency:** `LegacyProductoSyncService(prisma, legacySustratoService)` + `sync(): Promise<void>` identical across T3 (def), T5 (consume). `LegacyProducto` interface (Task 2 file) reused by T3 import. `legacyCodigo` naming identical across schema/service/tests/SQL.
- **No placeholders:** every task carries complete code/commands.
