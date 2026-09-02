# Mezcla Frontend Design Spec

**Date:** 2026-08-25
**Feature:** Mezclas (Mixtures) Frontend Module
**Backend:** `apps/backend/src/modules/mezcla/`
**Status:** Approved

---

## Overview

Build the frontend for the `mezcla` (mixture) backend module — list, create, and view detail UI. A mezcla is a composition of up to 4 sustratos (substrates) with percentage allocations that must sum to 100%.

---

## Data Model

### Current `MezclaDto` (shared schema)
```ts
{
  id: string
  sustrato1Id: string
  porcentaje1: number
  sustrato2Id: string | null
  porcentaje2: number | null
  sustrato3Id: string | null
  porcentaje3: number | null
  sustrato4Id: string | null
  porcentaje4: number | null
}
```

### Extended `MezclaDto` (after changes)
```ts
{
  id: string
  sustrato1Id: string
  sustrato1Nombre: string          // NEW
  porcentaje1: number
  sustrato2Id: string | null
  sustrato2Nombre: string | null   // NEW
  porcentaje2: number | null
  sustrato3Id: string | null
  sustrato3Nombre: string | null   // NEW
  porcentaje3: number | null
  sustrato4Id: string | null
  sustrato4Nombre: string | null   // NEW
  porcentaje4: number | null
  isActive: boolean                // NEW
  createdAt: Date                  // NEW
}
```

### Validation Rule
`CreateMezclaSchema` must include a `.refine()` that validates:
```ts
porcentaje1 + (porcentaje2 ?? 0) + (porcentaje3 ?? 0) + (porcentaje4 ?? 0) === 100
```
Error message: `"Los porcentajes deben sumar 100%"`

---

## Architecture

### Approach
Mirror the sustratos feature pattern exactly (Approach 1 from brainstorming). Same file structure, same libraries, same patterns.

### File Structure
```
apps/frontend/src/features/mezclas/
├── index.ts                          # Public exports
├── api/mezclaService.ts              # API service (clientFetch)
├── hooks/useMezclas.ts               # React Query hooks
└── components/
    ├── MezclasDashboard.tsx          # Suspense wrapper
    ├── mezcla-data-table.tsx         # DataTable orchestrator
    ├── columns.tsx                   # Table column definitions + export columns
    ├── mezcla-create-form.tsx        # Create form with 4 slots + calculator
    └── mezcla-view-form.tsx          # View form with composition display
```

### Shared Infrastructure Changes
- `packages/shared/src/schemas/mezcla.schema.ts` — extend `MezclaDto`, add validation
- `apps/frontend/src/constants/routes.ts` — add `MEZCLAS: "/mezclas"`
- `apps/frontend/src/lib/config/navigations.ts` — add Mezclas sub-item under Sustratos
- `apps/frontend/src/lib/queryKeys.ts` — add `mezclaQueryKeys`
- `apps/frontend/src/lib/query-invalidation-map.ts` — add `createMezcla`

### Backend Changes
- `apps/backend/src/modules/mezcla/repositories/mezcla.repository.ts` — add `include` for sustrato relations
- `apps/backend/src/modules/mezcla/mezcla.service.ts` — map relation names to `sustratoXNombre` fields

---

## Navigation

Mezclas will be a **sibling to "Lista"** inside the existing Sustratos sub-group:

```
Partidas
├── Siembra
├── A Extender
└── Sustratos
    ├── Lista (/sustratos)
    └── Mezclas (/mezclas)    ← NEW
```

Icon: `Blend` from lucide-react (represents mixing/combining).

---

## Table Design

### Columns
| Column | Field | Width | Notes |
|--------|-------|-------|-------|
| Sustrato 1 | `sustrato1Nombre` | auto | Always present, bold |
| %1 | `porcentaje1` | 60px | Always present |
| Sustrato 2 | `sustrato2Nombre` | auto | Nullable, show "-" |
| %2 | `porcentaje2` | 60px | Nullable |
| Sustrato 3 | `sustrato3Nombre` | auto | Nullable, show "-" |
| %3 | `porcentaje3` | 60px | Nullable |
| Sustrato 4 | `sustrato4Nombre` | auto | Nullable, show "-" |
| %4 | `porcentaje4` | 60px | Nullable |
| Creado | `createdAt` | 100px | Short date format |
| Acciones | — | 80px | View button |

### Column Styling
- Sustrato names: `font-black text-sm uppercase tracking-tight` (matches sustratos pattern)
- Percentage values: `font-mono text-xs font-bold text-muted-foreground`
- Empty slots: show `-` with `text-muted-foreground/40`

### Export Columns
- `sustrato1Nombre` → "Sustrato 1"
- `porcentaje1` → "% 1"
- `sustrato2Nombre` → "Sustrato 2"
- `porcentaje2` → "% 2"
- `sustrato3Nombre` → "Sustrato 3"
- `porcentaje3` → "% 3"
- `sustrato4Nombre` → "Sustrato 4"
- `porcentaje4` → "% 4"
- `createdAt` → "Creado"

---

## Create Form Design

### Layout
Fixed 4 rows, each containing:
1. **Sustrato selector** — `Select` dropdown populated from `useSustratos()` hook
   - Slot 1: required
   - Slots 2-4: optional (can be empty)
2. **Percentage input** — `Input type="number"` (0-100)
   - Disabled when sustrato is not selected
   - Required when sustrato is selected

### Real-Time Calculator
A sticky bar at the bottom of the form:
```
Total: 75%  ← red/warning style when != 100%
Total: 100% ← green/success style when == 100%
```

- Updates on every keystroke
- Submit button disabled when total != 100%
- Visual indicator: `Badge` with `CheckCircle` icon (green) or `AlertTriangle` icon (red)

### Validation
- Client-side: `zodResolver(CreateMezclaSchema)` with the `.refine()` rule
- Server-side: `ZodValidationPipe(CreateMezclaSchema)` in controller
- Error messages appear per-field and as a summary in the calculator bar

---

## View Form Design

### Header
- Gradient background: `bg-gradient-to-br from-primary/10 via-primary/5 to-transparent`
- Mezcla icon (`Blend`) in primary-colored square
- Title: "Mezcla: [composition summary]" (e.g., "Turba 60% / Perlita 40%")
- "Activo" badge with `CheckCircle` icon (green)

### Composition Display
Visual representation of the mix:
```
Sustrato 1: Turba          60%  ████████████░░░░░░░░
Sustrato 2: Perlita        40%  ████████░░░░░░░░░░░░
Sustrato 3: -               -  
Sustrato 4: -               -  
```

Each row shows:
- Sustrato name (or "-")
- Percentage value
- Visual bar proportional to percentage

### Footer
- Creation date in long Spanish format: "14 de marzo de 2024"
- `max-h` overflow constraint with scroll (matches sustratos pattern)

---

## Testing

### Required Tests
- `mezclaService.test.ts` — API service tests (mock clientFetch)
- `mezcla-data-table.test.tsx` — DataTable rendering with mock data
- `mezcla-view-form.test.tsx` — View form displays composition, badge, date

### Test Data
```ts
const mockMezcla: MezclaDto = {
  id: "1",
  sustrato1Id: "s1",
  sustrato1Nombre: "Turba",
  porcentaje1: 60,
  sustrato2Id: "s2",
  sustrato2Nombre: "Perlita",
  porcentaje2: 40,
  sustrato3Id: null,
  sustrato3Nombre: null,
  porcentaje3: null,
  sustrato4Id: null,
  sustrato4Nombre: null,
  porcentaje4: null,
  isActive: true,
  createdAt: new Date("2024-03-14"),
};
```

---

## Verification Order

Before committing:
```bash
pnpm --filter @vivero/shared build
pnpm lint
pnpm type-check
pnpm test
```

---

## Out of Scope
- Edit/delete functionality (backend doesn't support it yet)
- KPIs (not enough data for meaningful summaries)
- Batch operations
- Filtering/search (table is small enough)
