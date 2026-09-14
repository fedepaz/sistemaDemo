# Siembra Partidas Registradas — Rich DTO & View Form Enhancement

**Date:** 2026-09-05
**Status:** Approved
**Scope:** Backend DTO extension + Frontend view form with tabs

---

## Goal

Display all information from `AsignarUbiSiembraCompletaDto` in the siembra partidas registradas view form, resolving all foreign keys to human-readable names.

## Current State

The view form currently shows only the 10 fields stored in `SiembraPartidas`:
- `partidaId`, `anio`, `indice`, `metodoMaquina`, `presionSemilla`, `profundidadSemilla`, `tratamientoSemilla` (code), `mezclaId`, `userId`, `mezclaNombre`, `usuarioNombre`

Missing: legacy siembra fields (`cg`, `f_siembra`, `lote`, etc.), task shift data (`entityId`, `startTime`, `endTime`, employees), resolved treatment name, resolved employee usernames.

## Design

### 1. Shared Schema Extension

Extend `SiembraPartidaSchema` in `packages/shared/src/schemas/siembraPartida.schema.ts`:

```typescript
// From legacy partidas table
cg: z.number().optional(),
fSiembra: z.string().optional(),
lote: z.number().optional(),
anoLote: z.number().optional(),
item: z.number().optional(),
semxgr: z.number().optional(),
ajuste: z.string().optional(),
cantidadGrs: z.number().optional(),
cantidaNroCont: z.number().optional(),
detalleExtendido: z.string().optional(),

// Resolved names
tratamientoNombre: z.string().optional(),

// From taskShifts table
entityId: z.string().optional(),
startTime: z.string().optional(),
endTime: z.string().optional(),
empleados: z.array(z.object({
  userId: z.string(),
  username: z.string(),
})).optional(),
```

### 2. Backend Repository Additions

**`PartidasRepository`** — add `findByComposite(partida, ano, indice)`:
- Queries `partidas` + `partidas1` by composite key
- Returns `LegacyPartidas | null`
- Selects: `cg`, `f_siembra`, `lote`, `ano_lote`, `item`, `semxgr`, `ajuste`, `cantidad`, `con`, `tratamien`, `detalle` (extendido)

**`TaskShiftsRepository`** — add `findByPartidaComposite(partidaId, anio, indice)`:
- Queries `TaskShift` + employees by composite key
- Returns `TaskShiftWithEmployees | null`

### 3. Backend Module Wiring

Update `SiembraPartidasModule`:
- Import `LegacyPartidasModule` (for `PartidasRepository`)
- Import `TaskShiftsModule` (for `TaskShiftsRepository`)
- Import `LegacyTratamientoModule` (for `TratamientoRepository`)
- Export `SiembraPartidasService`

Inject into `SiembraPartidasService`:
- `PartidasRepository`
- `TaskShiftsRepository`
- `TratamientoRepository`

### 4. Backend Service Changes

**`SiembraPartidasService`**:

- `getAllSiembraPartidas` and `getSiembraPartidaById` fetch from all 3 sources:
  1. Prisma `SiembraPartidas` (web fields + mezcla + user)
  2. Legacy `partidas` table (via `PartidasRepository.findByComposite()`)
  3. Prisma `TaskShift` (via `TaskShiftsRepository.findByPartidaComposite()`)

- `mapToDto` merges all sources into extended DTO:
  - `tratamientoNombre` resolved via `TratamientoRepository.findOne(codigo)`
  - `empleados` resolved via `prisma.user.findMany()` mapping `userId` → `username`
  - Legacy fields mapped: `cg` → `cg`, `f_siembra` → `fSiembra`, `lote` → `lote`, etc.

### 5. Frontend View Form

**Structure** — Same pattern as `extendido-view-form.tsx`:

**Fixed Header** (always visible):
- Partida #, Mezcla nombre
- Specs grid: Año, Índice, Método, Presión

**Tabs** (3 tabs):
- **Siembra** — Profundidad, Tratamiento (resolved name), Cámara germinación, Cantidad contenedor, Fecha siembra, Detalle extendido
- **Lote** — Lote, Año lote, Item, Semillas/gr, Ajuste, Cantidad (gr)
- **Turno** — Entidad, Hora inicio, Hora fin, Empleados (resolved usernames)

Each tab uses `Card` + `InfoRow` components. Empty fields show `-`.

## Files to Modify

| File | Change |
|------|--------|
| `packages/shared/src/schemas/siembraPartida.schema.ts` | Extend `SiembraPartidaSchema` with new fields |
| `apps/backend/src/modules/legacy/partidas/repositories/partidas.repository.ts` | Add `findByComposite()` |
| `apps/backend/src/modules/taskShifts/repositories/taskShifts.repository.ts` | Add `findByPartidaComposite()` |
| `apps/backend/src/modules/siembraPartidas/siembraPartidas.module.ts` | Import modules, inject repos |
| `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts` | Extend `mapToDto`, fetch from 3 sources |
| `apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-view-form.tsx` | Rewrite with tabs |

## Verification

1. `pnpm lint && pnpm type-check && pnpm test`
2. Navigate to `/siembra/partidas-registradas`, click a row
3. Verify all 3 tabs show correct data
4. Verify resolved names (tratamiento, employees, mezcla)
