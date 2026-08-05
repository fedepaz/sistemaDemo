# FaltantePlantas Row Grouping Design

**Date:** 2026-08-01
**Status:** Draft
**Author:** opencode

## Problem

The FaltantePlantas alert type can return multiple rows for the same `partidaId` when different `indice` values exist. Each `indice` represents a different seed batch contributing to the same total order (`solicito`). The current UI shows each row separately, which is confusing because:

- The `solicito` value is the same on every row (it's the total order)
- The `porPr` value is per-seed-batch (each `indice` has its own germination estimate)
- The user wants to see the **total** estimated germination across all batches

## Requirement

When multiple rows share the same `partidaId` but have different `indice` values:

1. Show **one row** per `partidaId`
2. Keep the **first row's** fields (partidaId, codigoEspecie, nombreEspecie, nrocont, pr, stIniPr, hai, etc.)
3. Replace `porPr` with the **sum** of all rows' `porPr` for that `partidaId`
4. Recalculate `diferencia` as `solicito - sum(porPr)`
5. Add a **badge** like `+3` next to the partida number showing how many sub-indices were grouped
6. Hide the other rows entirely

## Design

### Architecture

Frontend-only approach. The backend continues to return raw rows. Grouping happens via `useMemo` in the dashboard component before data reaches the DataTable.

```
Raw API data → groupFaltantePlantas() → DataTable
```

### Files to Modify

| File | Change |
|------|--------|
| `packages/shared/src/schemas/alerts.schema.ts` | Add `subRowCount?: number` to `FaltantePlantasDtoSchema` |
| `apps/frontend/src/features/alerts/utils/group-faltante-plantas.ts` | **NEW** — grouping utility |
| `apps/frontend/src/features/alerts/components/v1/AlertsDashboardV1.tsx` | Apply grouping via `useMemo` |
| `apps/frontend/src/features/alerts/components/shared/alert-columns.tsx` | Show `+N` badge in `partidaId` column |

### Grouping Algorithm

```typescript
function groupFaltantePlantas(data: FaltantePlantasDto[]): FaltantePlantasDto[] {
  const grouped = new Map<number, FaltantePlantasDto[]>();

  // Group by partidaId
  for (const row of data) {
    const existing = grouped.get(row.partidaId);
    if (existing) {
      existing.push(row);
    } else {
      grouped.set(row.partidaId, [row]);
    }
  }

  // Transform each group
  const result: FaltantePlantasDto[] = [];
  for (const rows of grouped.values()) {
    if (rows.length === 1) {
      result.push(rows[0]);
    } else {
      // Keep first row, sum porPr
      const first = { ...rows[0] };
      first.porPr = rows.reduce((sum, r) => sum + Number(r.porPr ?? 0), 0);
      first.subRowCount = rows.length - 1;
      result.push(first);
    }
  }

  return result;
}
```

### Dashboard Integration

```typescript
const { data: faltantePlantasRaw } = useFaltantePlantas();
const faltantePlantas = useMemo(
  () => groupFaltantePlantas(faltantePlantasRaw),
  [faltantePlantasRaw]
);
```

### Badge Display

In the `partidaId` column definition, when `subRowCount > 0`:

```tsx
<div className="font-black text-sm text-foreground/80 tracking-tight">
  #{row.original.partidaId}
  {row.original.indice !== 0 && `/ ${row.original.indice}`}
  {row.original.subRowCount && row.original.subRowCount > 0 && (
    <Badge variant="secondary" className="ml-1 text-[9px]">
      +{row.original.subRowCount}
    </Badge>
  )}
</div>
```

### Diferencia Recalculation

The `diferencia` column already computes `solicito - porPr` in the cell renderer. Since `porPr` is replaced with the sum during grouping, the `diferencia` calculation automatically uses the summed value. No change needed.

### Export Impact

The export columns (`faltantePlantasExportColumns`) will export the grouped data since the DataTable passes the same data to both display and export. This is correct — exports should reflect the same grouped view.

## Testing

- Add unit tests for `groupFaltantePlantas`:
  - Single row (no grouping)
  - Multiple rows with same `partidaId`, different `indice` → grouped
  - Multiple groups → each grouped independently
  - Empty array → empty result
  - `porPr` sum correctness
  - `subRowCount` correctness
- Verify existing DataTable tests still pass

## Out of Scope

- Backend/SQL changes
- Changes to other alert types
- Changes to the comment system or SlideOverForm
