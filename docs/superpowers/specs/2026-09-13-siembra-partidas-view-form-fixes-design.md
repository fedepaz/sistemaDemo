# Design: SiembraPartidas View Form — Typo Fix + Encargado

**Date:** 2026-09-13
**Status:** Approved
**Author:** opencode

## Context

The siembraPartidas view form has a typo ("Presion" instead of "Prensado") and doesn't show who created the taskshift. The user wants both fixed.

## Changes

### 1. Fix Typo
`apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-view-form.tsx` line 171:
- `label="Presion"` → `label="Prensado"`

### 2. Surface TaskShift Creator

**Backend (`apps/backend/src/modules/taskShifts/repositories/taskShifts.repository.ts`)**:
- Add `createdByUser: { select: { username: true } }` to `findByPartidaComposite` include
- Update `TaskShiftWithEmployees` type to include `createdByUser: { username: string } | null`

**Shared (`packages/shared/src/schemas/siembraPartida.schema.ts`)**:
- Add `createdByNombre: z.string().optional()` to `SiembraPartidaSchema`

**Backend (`apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts`)**:
- In `mapToDto`, resolve `taskShift.createdByUser?.username` into `createdByNombre`

**Frontend (`apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-view-form.tsx`)**:
- Add InfoRow in Turno tab before Empleados: `label="Encargado"`, `value={selectedPartida.createdByNombre}`

## Files to Modify

1. `apps/backend/src/modules/taskShifts/repositories/taskShifts.repository.ts`
2. `packages/shared/src/schemas/siembraPartida.schema.ts`
3. `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts`
4. `apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-view-form.tsx`

## Out of Scope

- No changes to the taskshift creation flow
- No changes to the siembraPartidas creation flow
- No changes to the data table columns (only the view form)

## Testing

- Run `pnpm lint && pnpm type-check && pnpm test`
- Verify the Turno tab shows "Encargado" with the taskshift creator name
- Verify "Prensado" label is correct
