# Design: Estado inactive — productos & fórmulas

**Date:** 2026-10-02
**Status:** Approved (design sections, verbally)
**Branch target:** `feat/finish-mezcla`

## Problem

Soft-deleted (inactive) productos/formulas are visible to dev users in the list tables, but nothing in the UI distinguishes them from active rows — a dev cannot tell what has been deleted. Additionally, a formula row keeps its denormalized `productoNNombre` after the referenced producto is deleted, so formulas silently keep referencing products that no longer exist. Common (non-dev) users never receive inactive rows (server filters `deletedAt: null`), so any positive "Activo" marking would be confusing dead UI — marking is **negative-only**: active rows look exactly as today.

## Locked decisions

1. **Approach A** (frontend cross-reference) with approach B (backend per-slot flags in `FormulaDto`) deferred as a future, strictly additive escape hatch.
2. **No "Activo" anywhere.** Only inactive/deleted entities get visual treatment.
3. **No new Estado column** on productos or formulas; no export changes.
4. Productos/formulas lists: inactive rows are **dimmed/muted only**; state detail (`Inactivo` badge) lives in the **view form**, shown only when inactive.
5. Formula list: cells referencing a deleted/inactive producto are **marked in place** with a warning icon + tooltip.
6. Formula create selectors: inactive productos remain visible but **disabled and labeled**.
7. **queryKeys/invalidation: verified already complete, zero changes** (`deleteProducto → productoQueryKeys.all()` etc. — deleting a producto invalidates the productos list, which recomputes formula-list warnings automatically).

## Data layer

### Shared (`packages/shared/src/schemas/productos.schema.ts`)

- `ProductoSchema` += `isActive: z.boolean()`.
- Only shared change. `FormulaSchema`/`FormulaDto` untouched — already carries `isActive: z.boolean()`.

### Backend (`apps/backend/src/modules/productos/productos.service.ts`)

- Include `isActive` from the repository row in `getAllProductos` and `getProductoById`, which currently strip it (map to `{id, nombre, createdAt}`). `createProducto`/`updateProducto` return the full repository row already (includes `isActive`); controller response shape confirmed at plan time.
- No query changes: `BaseRepository.findAll` already returns full rows including `isActive`.

## Frontend

### Productos list

- `producto-data-table.tsx`: pass `getRowClassName` (existing DataTable prop, data-table.tsx:96) → inactive rows get `opacity-60 text-muted-foreground` (standard Tailwind utilities, no arbitrary values). Active rows: unchanged.
- `producto-view-form.tsx`: render `<Badge>Inactivo</Badge>` **only when `!selectedProducto.isActive`**; active shows nothing new.

### Formulas list

- `formula-data-table.tsx`:
  - `getRowClassName`: same dim treatment for inactive formulas.
  - Build `inactiveProductoIds: Set<string>` from `useProductos()`: an id is in the set when the producto is present with `isActive === false` **or absent entirely** (common users do not receive deleted rows at all). Memoized on productos data.
- `columns.tsx`: convert `formulaColumns` into a factory `createFormulaColumns(inactiveProductoIds: Set<string>)` (export columns unchanged — names still export as-is).
  - `ProductoCell` (slots 1–4): if the slot has an id and it is in the set → render name + small warning icon with tooltip `"Producto eliminado"`; otherwise unchanged. Empty slots unchanged.
  - Detection edge: an id pointing at a row that never existed also marks (acceptable — data error).
- `formula-view-form.tsx`: same conditional `Inactivo` badge as producto view form.

### Formula create form

- `formula-create-form.tsx` `ProductoSlot`: inactive options render via a `disabled` `SelectItem` with muted/strikethrough label suffix `"Eliminado"`; active options unchanged.

### Permissions note

The formulas page already depends on `useProductos()` (create form), so cross-referencing adds no new permission assumption. A user without `productos:read` is already unable to use the formulas page today; no change.

## Testing (TDD)

- **Shared:** `ProductoSchema` parses/rejects `isActive` correctly.
- **Backend:** service spec fixtures += `isActive` and assertion that all return paths include it; integration tests: `GET /productos` and create/update responses include `isActive: expect.any(Boolean)` (update `mockProductoDto` fixture).
- **Frontend:**
  - Inactive producto row → dim class applied; active row → not.
  - Producto view form: `Inactivo` badge when `isActive: false`; absent when `true`.
  - Formula view form: same.
  - Formula cell marking: inactive producto → marked; absent producto → marked; active producto → unmarked; empty slot → unmarked.
  - Selector: inactive option disabled and labeled `Eliminado`; active option enabled.
  - Fixture literals typed as `ProductoDto` updated (`isActive: true`) — compile-fix set discovered by `type-check`.

## Out of scope

- Approach B: per-slot `productoNActivo` flags in `FormulaDto` (future, additive).
- Programación siembra selectors (formula selector / producto selector there).
- Recover/restore endpoints; `MANAGED_ENTITIES`; audit `entityType` for productos/formulas (known limitation already documented in the CRUD spec).
- Export column changes.

## Known limitations

- If a formula references a producto that never existed, the cell is marked identically to a deleted one.
- The dim treatment is the only in-list state signal; precise state is view-form only (intentional, per decision 4).
