# Design: DataTable Smart Search Bar

**Date:** 2026-09-03
**Status:** Approved
**Scope:** `apps/frontend/src/components/data-display/data-table/`

---

## Problem

The `DataTable` component has `globalFilter` infrastructure wired up (state, `getFilteredRowModel`, `includesString` function) but no UI to control it. Users cannot search across table data without implementing their own search logic per feature.

## Goal

Add a global search bar to all `DataTable` instances that filters rows across all visible columns in real-time, with a clear button and results count badge.

## Design Decisions

- **Approach:** Opt-out with `enableSearch` prop (default `true`) — all 20 existing tables get search automatically
- **Placement:** Separate row above the existing toolbar
- **Filtering:** Real-time, client-side, case-insensitive `includesString` match against all visible columns
- **Search bar elements:** Magnifying glass icon, text input, clear (X) button, results count badge

---

## Section 1: Component API

### New prop on `DataTableProps`

```typescript
enableSearch?: boolean; // default: true
```

When `enableSearch` is not set or is `true`, the search bar renders. When `enableSearch={false}`, the search bar is hidden.

### No consumer changes required

All 20 existing `<DataTable` usages inherit the search bar automatically. Only tables that need to hide it (e.g., tiny reference lists) pass `enableSearch={false}`.

---

## Section 2: Search Bar UI

### Layout

The search row renders between `CardHeader` and the toolbar row:

```
┌─────────────────────────────────────────────────────────────┐
│ [🔍] [Buscar en la tabla...                        ] [✕]   │  search row
│                                                     12/150  │  count badge
├─────────────────────────────────────────────────────────────┤
│ [Columnas ▾] [Exportar] [Nuevo]                             │  existing toolbar
├─────────────────────────────────────────────────────────────┤
│ Partida  | Código | Especie | ...                           │  table rows
│ ...                                                        │
└─────────────────────────────────────────────────────────────┘
```

### Elements

1. **Search input:** shadcn `Input` with `Search` icon (lucide) on the left, placeholder `"Buscar en la tabla..."`
2. **Clear button:** `X` icon button on the right, visible only when `globalFilter` is not empty, resets filter to `""`
3. **Results count badge:** Shows `"{filtered} de {total}"` — updates in real-time as user types

### Responsive behavior

- `sm` breakpoint: Hide count badge, shorten placeholder
- `md`+: Full layout as shown above

### Styling

- Same height as toolbar buttons (h-8)
- Consistent border/background with existing toolbar elements
- Compact, not prominent — visually subordinate to table content

---

## Section 3: Filtering Behavior

### How it works

1. User types in the search input
2. `setGlobalFilter(value)` updates TanStack Table's `globalFilter` state
3. `getFilteredRowModel()` re-filters rows using `includesString` (case-insensitive)
4. Table re-renders with filtered rows
5. Count badge updates: `table.getFilteredRowModel().rows.length` of `data.length`

### Search scope

- Searches against the **stringified cell value** of every **visible** column
- Hidden columns (via column visibility or responsive breakpoints) are NOT searched
- This is intentional: "what you see is what you search"

### Edge cases

| Scenario | Behavior |
|----------|----------|
| Empty input | All rows shown, no filter applied |
| No matches | Shows "No se encontraron resultados" (existing empty state) |
| 0 rows in data | Search bar renders, count shows "0 de 0" |
| Column filters + global search | Both apply (AND logic) |
| Pagination | Search filters across all pages, pagination applies after filter |

---

## Section 4: Implementation

### Files to change

| File | Change |
|------|--------|
| `data-table.tsx` | Add `enableSearch` prop to `DataTableProps`, render search row with `Input`, clear button, count badge. Import `Search` and `X` from lucide. |
| `data-table.test.tsx` | Add tests for search bar rendering, filtering, clear button, count badge |

### No changes to

- Any feature-level data-table files (20 files untouched)
- No new components or files needed
- No schema/DTO changes

### Tests to add

1. Search bar renders when `enableSearch` is not set (default)
2. Search bar hidden when `enableSearch={false}`
3. Typing in search filters rows (verify row count changes)
4. Clear button resets filter and shows all rows
5. Count badge updates as user types
6. Empty state shows "No se encontraron resultados" when no matches

---

## Non-goals

- Server-side search (all data is already client-side)
- Fuzzy/typo-tolerant matching (future enhancement)
- Column-specific search toggles (future enhancement)
- Debouncing (not needed for client-side data)
- Keyboard shortcuts (e.g., Ctrl+F to focus search)
