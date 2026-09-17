# De-autorizar Siembra Partidas — Design Spec

## Context

The siembra authorization flow is one-directional: `programacionSiembra → aSembrar → siembraPartidasRegistradas`. Users need the ability to **reverse authorization** — moving a partida from `aSembrar` back to `programacionSiembra` — without completing the siembra form.

## Decision: `isActive` Toggle

**Mechanism**: Toggle the existing `isActive` boolean field on `SiembraPartidas`.

| State | `isActive` | `profundidadSemilla` | Appears in |
|-------|-----------|---------------------|------------|
| Not authorized | No row exists | — | programacionSiembra only |
| Authorized | `true` | `0` | programacionSiembra + aSembrar |
| De-authorized | `false` | `0` | programacionSiembra only |
| Completed | `true` | `> 0` | programacionSiembra + registradas |

**No migration needed** — `isActive` already exists on the `SiembraPartidas` model. The `findPendingSiembraPartidas` query already filters `isActive: true`.

## Backend Changes

### 1. New endpoint: `PATCH /siembra-partidas/:id/desautorizar`

**File**: `apps/backend/src/modules/siembraPartidas/siembraPartidas.controller.ts`

```ts
@Patch(':id/desautorizar')
@RequirePermission({
  tableName: 'programacion_siembra',
  action: 'create',
  scope: 'ALL',
})
async desautorizarSiembra(
  @CurrentUser() user: AuthUser,
  @Param('id') id: string,
): Promise<SiembraPartidaDto> {
  return this.service.desautorizarSiembra(id, user.id);
}
```

### 2. Service method: `desautorizarSiembra`

**File**: `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts`

- Find row by `id` (must exist, `deletedAt: null`)
- Validate `profundidadSemilla.toNumber() === 0` — cannot de-authorize a completed siembra
- Validate `isActive === true` — already de-authorized
- Set `isActive = false`
- Return updated row

### 3. Modify `autorizarSiembra` — support re-authorization

**File**: `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts`

Current behavior: throws `ConflictException` if row exists for the same composite key.

New behavior:
- If row exists with `isActive: false` → **re-authorize** by setting `isActive: true`, resetting `profundidadSemilla = 0`, and returning the updated row
- If row exists with `isActive: true` → still throws `ConflictException` (already authorized)

## Frontend Changes

### 1. API service

**File**: `apps/frontend/src/features/programacionSiembra/api/programacionSiembraService.ts`

```ts
desautorizarSiembra: (id: string) => {
  return clientFetch<SiembraPartidaDto>(`siembra-partidas/${id}/desautorizar`, {
    method: "PATCH",
  });
},
```

### 2. Mutation hook

**File**: `apps/frontend/src/features/programacionSiembra/hooks/useProgramacionSiembraPartidaMutation.ts`

Add `useProgramacionSiembraDesautorizacion`:
- Calls `programacionSiembraService.desautorizarSiembra`
- On success: invalidates `siembraPartida` queries (same as autorizar), shows toast "Partida desautorizada"

### 3. DataTable — conditional SlideOverForm

**File**: `apps/frontend/src/features/programacionSiembra/components/programacionSiembra-data-table.tsx`

When `isAlreadyAuthorized`:
- SlideOverForm `saveLabel` = "Desautorizar"
- `confirm.title` = "Desautorizar siembra"
- `confirm.description` = "¿Deseas desautorizar esta partida? Volverá a programación de siembra."
- `confirm.label` = "Desautorizar"
- Form content: show read-only partida info (same as view mode) + warning banner
- `onSubmit` calls `desautorizarSiembra(selectedPartida.id)` instead of `autorizarSiembra`

When NOT `isAlreadyAuthorized`:
- Current behavior (authorize form)

### 4. Edit form — de-authorized state

**File**: `apps/frontend/src/features/programacionSiembra/components/autorizar-programacionSiembra-edit-form.tsx`

When `isAlreadyAuthorized`:
- Show read-only partida info (product header + detalle partida sections)
- Show yellow warning: "Esta partida ya fue autorizada para siembra"
- No form fields needed — just the info + confirm on save

## Row Color Behavior

Already handled by existing `getRowBg` logic in `columns.tsx`:
- `aSembrarKeys.has(key)` → `bg-yellow-500/10`
- `registradasKeys.has(key)` → `bg-green-500/10`
- Neither → `""` (default)

When de-authorized, the row disappears from `aSembrarKeys`, so it naturally reverts to default color.

## Query Invalidation

The `siembraPartida` invalidation key already covers all three queries:
- `programacionSiembraQueryKeys.partidas()` — programacionSiembra table refreshes
- `programacionSiembraPartidasRegistradasQueryKeys.all()` — registradas refreshes
- `aSembrarQueryKeys.all()` — aSembrar refreshes (row disappears)

## Guard Rails

1. Cannot de-authorize a completed siembra (`profundidadSemilla > 0`)
2. Cannot de-authorize an already de-authorized row (`isActive: false`)
3. Re-authorization restores the row to `isActive: true, profundidadSemilla: 0`
4. All operations require `programacion_siembra` permission

## Verification

```bash
pnpm type-check && pnpm lint
```
