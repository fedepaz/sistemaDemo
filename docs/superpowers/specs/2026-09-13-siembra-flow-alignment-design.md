# Design: Align Siembra Flow with Simplified Backend

**Date:** 2026-09-13
**Status:** Approved
**Author:** opencode

## Context

The last commit simplified the siembra backend query to return only pending records with new fields (`semEntrega`, `f_ent`, `estado`) and simplified the `aSembrarEditForm` by removing `f_siembra`, `cantidadGrs`, and `ajuste` fields. However, the rest of the flow (schema, backend service, frontend columns) was not updated, causing a mismatch between the form and the backend validation.

## Goal

Align the entire siembra flow with the simplified form:
- Remove `f_siembra`, `cantidadGrs`, `ajuste` from the schema
- Auto-set `f_siembra` to today's date on the backend
- Show `semEntrega` in the siembra table (replacing `fechaSiembraReal`)
- Update the confirmation dialog summary

## Changes

### 1. Shared Schema (`packages/shared/src/schemas/partidas.schema.ts`)

**`AsignarUbiSiembraDtoSchema`** — remove 3 fields:
- `f_siembra: z.coerce.date()` — remove entirely
- `cantidadGrs: z.number().positive()` — remove entirely
- `ajuste: z.string().min(1)` — remove entirely

Keep: `cg`, `cantidaNroCont`, `detalleExtendido`, `lote`, `anoLote`, `item`, `semxgr`

**`SiembraDtoSchema`** (`packages/shared/src/schemas/siembra.schema.ts`) — add:
- `semEntrega: z.string()` — delivery week format "WEEK-YEAR HOUR"

### 2. Backend Interface (`apps/backend/src/modules/legacy/siembra/interfaces/siembra.interface.ts`)

Add to `LegacySiembra`:
- `semEntrega: string` — already in the SQL SELECT, just missing from the TypeScript interface

### 3. Backend Service (`apps/backend/src/modules/legacy/siembra/siembra.service.ts`)

In `mapToDto()`, add:
- `semEntrega: row.semEntrega`

### 4. Backend Partidas Service (`apps/backend/src/modules/legacy/partidas/partidas.service.ts`)

In `completarSiembraLegacy()`:
- Auto-set `f_siembra` to `new Date()` instead of reading from DTO
- Remove `ajuste` from the legacy DB update query
- Remove `cantidadGrs` (mapped to `cantidad`) from the legacy DB update query

### 5. Frontend Siembra Columns (`apps/frontend/src/features/siembra/components/columns.tsx`)

Replace `fechaSiembraReal` column with `semEntrega`:
```typescript
{
  accessorKey: "semEntrega",
  header: ({ column }) => (
    <SortableHeader column={column}>Sem Entrega</SortableHeader>
  ),
  cell: ({ row }) => (
    <span className="text-sm font-semibold">{row.original.semEntrega || "-"}</span>
  ),
}
```

Update export columns: replace `fechaSiembraReal` export with `semEntrega`.

### 6. Frontend aSembrar Confirmation Dialog (`apps/frontend/src/features/aSembrar/components/a-sembrar-data-table.tsx`)

Remove from `summaryFields`:
- `f_siembra`
- `cantidadGrs`
- `ajuste`

## Files to Modify

1. `packages/shared/src/schemas/partidas.schema.ts` — remove fields from schema
2. `packages/shared/src/schemas/siembra.schema.ts` — add semEntrega field
3. `apps/backend/src/modules/legacy/siembra/interfaces/siembra.interface.ts` — add semEntrega
4. `apps/backend/src/modules/legacy/siembra/siembra.service.ts` — map semEntrega
5. `apps/backend/src/modules/legacy/partidas/partidas.service.ts` — auto-set f_siembra, remove ajuste/cantidadGrs
6. `apps/frontend/src/features/siembra/components/columns.tsx` — replace fechaSiembraReal with semEntrega
7. `apps/frontend/src/features/aSembrar/components/a-sembrar-data-table.tsx` — update summaryFields

## Out of Scope

- siembraPartidas view form (stays as-is per user request)
- aSembrar columns (fSiembra stays, it's the authorization date)
- Backend query changes (already done in last commit)

## Testing

- Run `pnpm lint && pnpm type-check && pnpm test` to verify no regressions
- Verify the aSembrar form submits successfully without f_siembra/cantidadGrs/ajuste
- Verify the siembra table shows semEntrega column
- Verify the confirmation dialog doesn't show removed fields
