# Design: Deletion info (deletedAt + deleter) — productos & fórmulas

**Date:** 2026-10-03
**Status:** Approved (design, verbally)
**Branch target:** `feat/finish-mezcla`

## Problem

Dev admins are the only users who see soft-deleted rows, but the UI only shows *that* a record is inactive (dim + `Inactivo` badge) — not **when** it was deleted or **by whom**. The data already exists (`BaseRepository.softDelete` writes `deletedAt` + `deletedByUserId`; both Prisma models have the `deletedByUser` relation); only username resolution, DTO exposure, and a view-form line are missing.

## Locked decisions

1. **DRY mechanism:** one protected `enrichDeletedBy(rows)` helper in `BaseRepository` (approach A), **opt-in call sites** — only `ProductosRepository` and `FormulaRepository` call it, so no other entity's API response changes.
2. **DTO/UI scope:** `ProductoDto` and `FormulaDto` only. Generic mechanism is reusable by any repo later.
3. **Display:** view forms only (`producto-view-form`, `formula-view-form`); lists stay as they are (dim only).
4. **Negative-only marking preserved:** the deletion line renders only when `deletedAt` is set; active records show nothing new; no `Activo` anywhere.
5. **queryKeys/invalidation: ZERO changes. No migrations** (columns + relations already exist).

## Data layer

### Shared schemas

`ProductoSchema` and `FormulaSchema` each gain:

```ts
deletedAt: z.date().nullable(),
deletedByUserId: z.string().nullable(),
deletedByUsername: z.string().nullable(),
```

Rationale for including `deletedByUserId`: formula responses already carry it as a Prisma scalar (service returns repo rows untyped today); typing it keeps both DTOs symmetric and honest. Display consumes only `deletedAt` + `deletedByUsername`.

### Backend — BaseRepository (the DRY part)

Add one protected method:

```ts
protected async enrichDeletedBy<R extends { deletedByUserId: string | null }>(
  rows: R[],
): Promise<(R & { deletedByUsername: string | null })[]> {
  const ids = [...new Set(rows.map((r) => r.deletedByUserId).filter((id): id is string => id !== null))];
  if (ids.length === 0) {
    return rows.map((r) => ({ ...r, deletedByUsername: null }));
  }
  const users = await this.prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, username: true },
  });
  const byId = new Map(users.map((u) => [u.id, u.username]));
  return rows.map((r) => ({
    ...r,
    deletedByUsername: r.deletedByUserId ? (byId.get(r.deletedByUserId) ?? null) : null,
  }));
}
```

Properties:
- **Zero extra queries** when no row has a `deletedByUserId` (the common-user and active-record paths).
- No Prisma relation required — works for `AuditLog`/`Tenant`, which lack `deletedByUser`.
- Lookup by raw id: a soft-deleted *deleter* still resolves.

**Hygiene fix:** `BaseRepository.recover()` additionally sets `deletedByUserId: null` (today it leaves a stale id after recovery; display is gated on `deletedAt`, so this is consistency, not behavior).

### Opt-in call sites

- `ProductosRepository`: override `findAll`/`findById` → `super` call + `enrichDeletedBy` (single-row path wraps/unwraps `[row]`).
- `FormulaRepository`: after `mapRow` in its `findAll`/`findById` overrides (mapRow stays synchronous).
- `ProductosService`: include the three fields in every `ProductoDto` mapping path. `getAll`/`getById` map them from the enriched row; `create`/`update` responses explicitly map `deletedAt: null, deletedByUserId: null, deletedByUsername: null` (fresh/active records are never deleted — no enrichment needed, but the DTO contract stays complete). Delete response stays the raw row (mirrors existing users DELETE shape; frontend ignores the body).
- `FormulaService`: no change (already returns enriched repo records; `FormulaRecord = Formula & FormulaDto` picks the new fields up from the DTO type).

## Frontend

Both view forms render a deletion line **only when `deletedAt` is set**. The rendered sentence reads `Eliminado el <fecha> por <username>`:

- Producto (`InfoRow` pattern): label `Eliminado`, value `el <fecha> por <username>`.
- Fórmula (existing "Creado" row pattern): label `Eliminado:`, value `el <fecha> por <username>`.
- Date format: same `es-AR` long style used by the existing "Creado" row (`toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })`).
- If `deletedByUsername` is null → omit the ` por …` clause (date-only line).
- Lists, columns, selectors, exports: untouched.

## Testing (TDD)

- **Shared:** schema accepts/parses the nullable fields; rejects non-nullable violations (e.g. `deletedAt: "nope"` → fail).
- **Backend:** `BaseRepository` helper — no ids → no `prisma.user` call + nulls appended; ids → usernames mapped; unknown user id → null. `recover` clears `deletedByUserId`. Producto service maps the three fields on all DTO paths. Formula record enrichment. Integration fixtures/assertions include the new fields on GET responses.
- **Frontend:** both view forms — deleted record renders the line with date + username; active record renders nothing; null username → date-only line.

## Out of scope

- Other entities' DTOs/UI (users, billboard, taskShifts, …) — mechanism is ready, wiring deferred.
- List-row tooltips / list columns for deletion info.
- Clearing stale `deletedByUserId` on any path other than `recover`.
- queryKeys, exports, migrations, recover-endpoint UX.

## Known limitations

- If a deleter's user row were hard-deleted (no path exists today), the line degrades to date-only.
- Formula responses previously leaked untyped `deletedAt`/`deletedByUserId` scalars; after this change they are typed — consumers see no behavioral difference.
