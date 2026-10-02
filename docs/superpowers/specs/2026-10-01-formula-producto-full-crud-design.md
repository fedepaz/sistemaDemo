# Design: Full CRUD for Formula & Producto

**Date:** 2026-10-01
**Status:** Approved (brainstorming)
**Scope:** `apps/backend` (formula, productos modules), `apps/frontend` (features/formulas, features/productos), no `packages/shared` changes.

## Context

Both features are read+create only in the UI; backend formula is GET+POST only, backend producto additionally has PATCH. Decision record from brainstorming:

- **Delete = soft delete only, no recover endpoint** (recovery is a manual/ops action).
- **Formula: C/R/D — no update anywhere** (no `UpdateFormulaSchema`, no PATCH, no edit form).
- **Producto: C/R/U/D** (PATCH exists; UI edit + both deletes are new).
- **Permission fix (option A):** `GET /formula` moves from `programacion_siembra:create` to `formulas:read`; the formulas table uses `tableName="formulas"` so action buttons gate on `formulas:update/delete`.
- **Approach 1:** plain soft delete mirroring `features/users`/`entities` — no reference-blocking checks.

## Goals

1. `DELETE` endpoints for both entities with correct permission keys, audit, and 404 handling.
2. Full frontend CRUD: producto edit + delete, formula delete — mirroring `features/users`.
3. Permission alignment so list visibility and action buttons key off `formulas`/`productos`.

## Non-Goals

- No recover endpoints; no formula update; no reference checks on delete (relation includes ignore `deletedAt`, so existing references keep displaying).
- No hard delete; no `MANAGED_ENTITIES` edits (dormant config, zero app consumers); no seed changes (admins grant via the existing permissions UI — entity rows exist from the rename migration).
- No shared-schema changes: delete takes only an id param; `UpdateProductoSchema` already exists.

## Design

### Backend — formula

- `formula.controller.ts`: add `DELETE /formula/:id` with `@RequirePermission({ tableName: 'formulas', action: 'delete', scope: 'ALL' })`; change `GET /formula` decorator to `{ tableName: 'formulas', action: 'read', scope: 'ALL' }`.
- `formula.service.ts`: `deleteFormula(id: string, requesterId: string)` → delegates to inherited `BaseRepository.softDelete(id, requesterId)`; throws `NotFoundException('Formula not found')` when nothing was deleted. Response shape mirrors the `users` DELETE endpoint.
- No other formula changes (repository already inherits `softDelete`; custom `findAll`/`findById` already exclude `deletedAt` rows for non-dev requesters).

### Backend — productos

- `productos.controller.ts`: add `DELETE /productos/:id` with `{ tableName: 'productos', action: 'delete', scope: 'ALL' }`.
- `productos.service.ts`: `deleteProducto(requesterId, id)` → inherited `softDelete`; `NotFoundException` when missing. Existing PATCH unchanged (it already restricts updates to `deletedAt: null, isActive: true`).

### Shared package

Zero changes.

### Frontend — formulas

- `api/formulaService.ts`: `remove(id)` → `DELETE formula/:id`.
- `hooks/useFormulas.ts`: `useDeleteFormula` → invalidates the formulas list and the new `deleteFormula` query key; add the key in `lib/queryKeys.ts` and the entry in `lib/query-invalidation-map.ts`.
- `formula-data-table.tsx`: `tableName="formulas"` (was `programacion_siembra`); wire `onDelete` with the DataTable's built-in `DeleteDialog` exactly like `features/users`; **no edit action**; no new form components.

### Frontend — productos

- `api/productoService.ts`: `update(id, data)` (PATCH) and `remove(id)` (DELETE).
- `hooks/useProductos.ts`: `useUpdateProducto`, `useDeleteProducto` with list invalidation; add `updateProducto`/`deleteProducto` keys + invalidation-map entries.
- `producto-data-table.tsx`: `onEdit` + `onDelete` mirroring `user-data-table.tsx` (SlideOver `mode: "edit"` pre-filled through a new `producto-edit-form.tsx` using the `UpdateProductoSchema` resolver; `DeleteDialog` for delete).
- `columns.tsx`: add gated edit/delete actions (DataTable already computes `allowedActions` from `usePermission(tableName)`).

### Permissions & audit

- Action buttons gate on `formulas:update/delete` and `productos:update/delete` through the existing `DataTable` permission logic; admins grant via the permissions admin UI (entity rows exist, `SYSTEM_ENTITIES` does not hide them).
- `AuditCrudInterceptor` (global) records UPDATE/DELETE automatically — no per-controller wiring.

### Error handling

- Backend: `NotFoundException` for missing ids; 403 from `PermissionsGuard` on missing/wrong keys; soft-deleted rows invisible to non-dev list/detail reads (existing filters).
- Frontend: follow each feature's existing mutation error handling (mirror `features/users`).

## Test Plan (TDD — red first)

**Backend unit:**
- Formula: controller spec (decorator metadata for GET `formulas:read` + new DELETE `formulas:delete`, 404 path), service spec (delegates to `softDelete`, throws `NotFoundException`), repository spec (`softDelete` behavior).
- Productos: controller (DELETE metadata, 404), service (delegate/throw), repository (`softDelete`).
- Update existing specs that assert the old `GET /formula` permission key.

**Integration:**
- `DELETE /formula/:id`: success, 404, 403 (wrong/missing permission); `GET /formula` reflects `formulas:read`.
- `DELETE /productos/:id`: success, 404, 403; existing PATCH cases stay green.

**Frontend:**
- `formulaService.remove`, `productoService.update/remove` service tests.
- Data-table wiring tests for formula delete and producto edit+delete (mirroring users' tests).
- Hook invalidation assertions per existing hook-test patterns.

**Gates:** `pnpm lint && pnpm type-check && pnpm test`, `pnpm --filter backend test:integration`.

## Acceptance

- Formula has C/R/D, producto C/R/U/D, end to end (API + UI).
- `GET /formula` and all formulas action buttons key off `formulas`; productos off `productos`.
- Soft-deleted rows disappear from lists/selectors for non-dev users; existing references still display.
- All gates green; zero shared-package changes; no new dependency on `MANAGED_ENTITIES`.
