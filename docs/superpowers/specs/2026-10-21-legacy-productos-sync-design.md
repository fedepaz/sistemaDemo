# Design: Legacy productos synced into Prisma Producto

**Date:** 2026-10-21
**Status:** Approved
**Constraints (user-mandated):** the Prisma migration is executed by the user; no commits at any point — the user reviews all changes before anything is committed.

## Context

The formula feature references productos by Prisma `Producto.id` (`Formula.producto1Id..4Id`). The real product catalog lives in the legacy `martin3.articulo` table. Legacy productos were recently exposed via read-only endpoints (`GET /l-sustrato/productos`, `GET /l-sustrato/productos/:codigo`) but the frontend must keep working with zero changes: formulas, producto selectors, and producto CRUD all consume `GET /productos` (Prisma-only today).

**Goal:** every producto that exists in the legacy catalog must exist in Prisma `Producto`, linked by its legacy `codigo`, so the existing formula flows work unchanged.

**Legacy definition (fixed):** `SELECT ... FROM articulo WHERE hai = 'O' AND tipo = 'PF'`. Production legacy data matches this; the local `martin3` snapshot has zero matching rows — that is expected and irrelevant.

**Invariant:** if 5 productos exist in legacy, Prisma contains at least those 5 rows, each bound to its legacy `codigo`. Prisma-only rows (manually created, e.g. "Ushuaia") are legitimate and stay unbound until legacy catches up.

## Decisions

| Question | Decision |
|---|---|
| Sync trigger | On read: `GET /productos` syncs before returning |
| Link field | `Producto.legacyCodigo String? @unique` (no FK — legacy DB is external) |
| Name conflict with existing manual row | **Adopt:** bind `legacyCodigo` to the existing row with that `nombre` |
| Legacy name later changes | **Follow legacy:** linked row's `nombre` is updated on sync |
| Legacy row disappears | Linked Prisma row is untouched |
| `ProductoDto` / frontend | **No changes** — synced rows are ordinary productos |
| `unidad` from legacy | Not imported (Producto has no unit concept) |
| Migration execution | User runs it (per project constraint) |
| Commits | None until user reviews (per project constraint) |

## Schema & migration

```prisma
model Producto {
  // ...existing fields...
  legacyCodigo String? @unique @db.VarChar(50)
}
```

Migration SQL (user-executed): add nullable column + `CREATE UNIQUE INDEX Producto_legacyCodigo_key ON Producto(legacyCodigo)`. Existing rows keep `NULL` (allowed by MySQL unique semantics).

## Sync algorithm

New service `LegacyProductoSyncService` in the productos module, invoked at the top of `ProductosService.getAllProductos()` before the normal read.

1. Fetch legacy productos (`LegacySustratoService.getAllProductos()`), `ORDER BY codigo`, deduplicated by `codigo` (keep first occurrence — `articulo` contains duplicate codigos).
2. Read all Prisma productos (`findMany`, including inactive and soft-deleted — the `nombre` unique index applies to those too), selecting `id`, `nombre`, `legacyCodigo`, `isActive`, `deletedAt`.
3. For each legacy producto, in `codigo` order:
   - **Linked match** (`legacyCodigo = codigo`): follow-legacy — update `nombre` if it drifted. On unique-collision (P2002), skip the rename and warn-log. Never touch `isActive`/`deletedAt`.
   - **No link, but a non-deleted, not-yet-linked row has this `nombre`**: **adopt** — set `legacyCodigo = codigo` on it. `isActive`/`deletedAt` untouched (adopting an inactive row binds it but does not reactivate it).
   - **Name match exists but the row is soft-deleted**: skip + warn-log. No resurrection; the unique index would block a fresh insert under that name anyway.
   - **No match**: create `{ nombre, legacyCodigo: codigo }` (defaults: `isActive = true`).
   - **Second legacy item whose name is already taken** (by a just-created/adopted row or a manual row): skip + warn-log.
4. All writes occur inside a single `prisma.$transaction`. Steady state (no drift): one legacy query + one Prisma read + zero writes.

## Resilience & wiring

- The entire sync is wrapped in try/catch: if the legacy DB fails, log the error and serve the Prisma-only list (same pattern as `buildTratamientoNombre` in siembraPartidas).
- `ProductosModule` imports `LegacySustratoModule` (already exports `LegacySustratoService`; same wiring `SiembraPartidasModule` uses).
- New file: `apps/backend/src/modules/productos/legacy-producto-sync.service.ts`.
- No changes to `ProductoDto`, shared schemas, the frontend, or the formula module. `ensureGenericFormula` (upsert by nombre "Sustrato Genérico") is unaffected: it has no `legacyCodigo`, and legacy is not expected to contain that name.

## Bundled correctness fix

`SustratoRepository.findAllProductos` / `findOneProducto` currently query `hai = '0'`, which matches nothing. Change to `hai = 'O'` and add `ORDER BY codigo` to `findAllProductos`. These endpoints remain for API consistency; the frontend does not consume them.

## Testing (TDD)

New spec for `LegacyProductoSyncService` covering the diff matrix:

- creates a new row for an unmatched legacy producto
- adopts an existing active row by `nombre`
- renames a linked row when the legacy name drifted
- skips rename on unique collision (warn-log, no throw)
- skips a soft-deleted name match (no resurrection)
- skips a second legacy producto with a taken name
- deduplicates legacy rows sharing a `codigo`
- survives a legacy DB failure (no throw, no writes, list still served)

Plus: `ProductosService.getAllProductos` invokes sync before the repository read. Existing suites stay green. No DB needed in unit tests (legacy service and Prisma mocked).

## Out of scope

- Frontend display of "legacy" provenance
- Propagating deletions/deactivations in either direction
- `unidad` import
- Automated periodic sync (on-read sync makes cron unnecessary)
- Tests for the pre-existing `/l-sustrato` endpoints (module's test gap remains, tracked separately)
