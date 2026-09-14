# Design: Siembra Partidas Registradas — Read-Only DataTable

**Date:** 2026-09-05
**Status:** Approved
**Scope:** Backend DTO extension + new frontend feature

## Goal

Display a read-only DataTable of all `siembra_partidas` records (the new Prisma-managed planting data), with resolved mezcla composition and usernames. Follows the exact same patterns as the existing `siembra` and `extendidos` features.

## Backend Changes

### DTO Extension (`packages/shared/src/schemas/siembraPartida.schema.ts`)

Add two resolved fields to `SiembraPartidaSchema`:

- `mezclaNombre: z.string()` — e.g. "Tierra (70%) + Perlita (30%)"
- `usuarioNombre: z.string()` — e.g. "adminFede"

### Service Update (`apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts`)

- Modify `getAllSiembraPartidas` to use Prisma `include` for `mezcla` (with all sustrato relations) and `user` (select username)
- Add `buildMezclaNombre(mezcla)` helper that constructs a readable string from sustrato names and percentages
- Update `mapToDto` to include `mezclaNombre` and `usuarioNombre`

### Prisma Relations Used

```
SiembraPartidas.mezcla → Mezcla
  Mezcla.sustrato1 → Sustratos (nombre)
  Mezcla.sustrato2 → Sustratos (nombre)
  Mezcla.sustrato3 → Sustratos (nombre)
  Mezcla.sustrato4 → Sustratos (nombre)
SiembraPartidas.user → User (username)
```

## Frontend Changes

### Feature Structure

```
apps/frontend/src/features/siembraPartidas/
├── index.ts
├── api/
│   └── siembraPartidasService.ts
├── hooks/
│   └── useSiembraPartidasRegistradas.ts
└── components/
    ├── SiembraPartidasDashboard.tsx
    ├── siembra-partidas-dashboard-skeleton.tsx
    ├── siembra-partidas-view.tsx
    ├── siembra-partidas-data-table.tsx
    ├── columns.tsx
    └── siembra-partidas-view-form.tsx
```

### API Service

```ts
siembraPartidasService.fetchAll() → GET /siembra-partidas
```

Uses `clientFetch<SiembraPartidaDto[]>("siembra-partidas", { method: "GET" })`.

### Hook

```ts
useSiembraPartidasRegistradas() → useSuspenseQuery<SiembraPartidaDto[]>
```

Query key: `"siembraPartidasRegistradas"`.

### DataTable Columns

| Header | Field | Format |
|--------|-------|--------|
| Partida | `partidaId` | number |
| Año | `anio` | number |
| Índice | `indice` | number |
| Método | `metodoMaquina` | boolean → "Máquina" / "Manual" |
| Presión (PSI) | `presionSemilla` | number |
| Profundidad (cm) | `profundidadSemilla` | string |
| Tratamiento | `tratamientoSemilla` | string |
| Mezcla | `mezclaNombre` | string |
| Usuario | `usuarioNombre` | string |

### ViewForm (SlideOverForm, read-only)

Card-based layout showing all fields. Same pattern as `siembra-view-form.tsx`.

### Route

```
apps/frontend/src/app/(dashboard)/siembra/partidas-registradas/page.tsx
apps/frontend/src/app/(dashboard)/siembra/partidas-registradas/loading.tsx
```

Page renders `SiembraPartidasDashboard`. Loading renders `SiembraPartidasDashboardSkeleton`.

### Navigation

Add sidebar entry under the existing "Siembra" section for "Partidas Registradas".

## Data Flow

```
GET /siembra-partidas
  → SiembraPartidasController.getAllSiembraPartidas
  → SiembraPartidasService.getAllSiembraPartidas
    → Prisma query with include (mezcla + sustratos, user)
    → buildMezclaNombre() constructs display string
    → mapToDto() returns SiembraPartidaDto with resolved names
  → Frontend: useSiembraPartidasRegistradas() hook
  → SiembraPartidasDataTable renders columns
  → Click row → SlideOverForm (read-only)
```

## Testing

- Backend: Unit test for `buildMezclaNombre` helper
- Backend: Integration test for `getAllSiembraPartidas` with mocked Prisma
- Frontend: Component test for DataTable rendering
- Frontend: Hook test for `useSiembraPartidasRegistradas`

## Out of Scope

- Mutation/edit functionality (read-only)
- Filtering or search beyond DataTable built-in
- Export functionality
- Dashboard metrics/charts
