# Implementation Plan: De-autorizar Siembra Partidas

## Step 1: Backend — `desautorizarSiembra` service method

**File**: `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts`

Add new method after `autorizarSiembra` (line ~353):

```ts
async desautorizarSiembra(
  id: string,
  requesterId: string,
): Promise<SiembraPartidaDto> {
  const existing = await this.repo.findById(id, requesterId);
  if (!existing) {
    throw new NotFoundException('Registro de siembra no encontrado');
  }

  if (existing.profundidadSemilla.toNumber() !== 0) {
    throw new ConflictException(
      'No se puede desautorizar una partida ya completada',
    );
  }

  if (!existing.isActive) {
    throw new ConflictException('Esta partida ya fue desautorizada');
  }

  await this.repo.update(id, { isActive: false });

  const full = await this.repo.findById(id, requesterId);
  const [legacyData, taskShift] = await Promise.all([
    this.partidasRepo.findByComposite(
      existing.partidaId,
      existing.anio,
      existing.indice,
    ),
    this.taskShiftsRepo.findByPartidaComposite(
      existing.partidaId,
      existing.anio,
      existing.indice,
    ),
  ]);

  return this.mapToDto(
    full as SiembraPartidasWithRelations,
    legacyData,
    taskShift,
  );
}
```

## Step 2: Backend — Modify `autorizarSiembra` for re-authorization

**File**: `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts`

Replace lines 310–322 (the existing check) with:

```ts
const existing = await this.prisma.siembraPartidas.findFirst({
  where: {
    partidaId: data.partidaId,
    anio: data.anio,
    indice: data.indice,
    deletedAt: null,
  },
});

if (existing) {
  if (existing.isActive) {
    throw new ConflictException(
      'Esta partida ya fue autorizada para siembra',
    );
  }
  // Re-authorize: row exists but isActive = false
  await this.repo.update(existing.id, {
    isActive: true,
    profundidadSemilla: 0,
  });
  const full = await this.repo.findById(existing.id, requesterId);
  const [legacyData, taskShift] = await Promise.all([
    this.partidasRepo.findByComposite(
      existing.partidaId,
      existing.anio,
      existing.indice,
    ),
    this.taskShiftsRepo.findByPartidaComposite(
      existing.partidaId,
      existing.anio,
      existing.indice,
    ),
  ]);
  return this.mapToDto(
    full as SiembraPartidasWithRelations,
    legacyData,
    taskShift,
  );
}
```

## Step 3: Backend — Add controller endpoint

**File**: `apps/backend/src/modules/siembraPartidas/siembraPartidas.controller.ts`

Add `Patch` import and new endpoint:

```ts
import { Controller, Get, Param, Patch } from '@nestjs/common';

// ... after getSiembraPartida method:

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

## Step 4: Frontend — API service

**File**: `apps/frontend/src/features/programacionSiembra/api/programacionSiembraService.ts`

Add method:

```ts
desautorizarSiembra: (id: string) => {
  return clientFetch<SiembraPartidaDto>(`siembra-partidas/${id}/desautorizar`, {
    method: "PATCH",
  });
},
```

## Step 5: Frontend — Mutation hook

**File**: `apps/frontend/src/features/programacionSiembra/hooks/useProgramacionSiembraPartidaMutation.ts`

Add new hook:

```ts
export const useProgramacionSiembraDesautorizacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      programacionSiembraService.desautorizarSiembra(id),
    onSuccess: () => {
      invalidateQueries(queryClient, "siembraPartida");
      toast.success("Partida desautorizada", { duration: 3000 });
    },
  });
};
```

## Step 6: Frontend — DataTable conditional SlideOverForm

**File**: `apps/frontend/src/features/programacionSiembra/components/programacionSiembra-data-table.tsx`

Changes:
1. Import `useProgramacionSiembraDesautorizacion`
2. Add `desautorizarSiembra` from the new hook
3. Add `handleDesautorizar` callback
4. Make `SlideOverForm` props conditional on `isAlreadyAuthorized`

The `saveLabel`, `confirm` config, and `onSubmit` handler switch between authorize/de-authorize based on `isAlreadyAuthorized`.

## Step 7: Frontend — Edit form de-authorized state

**File**: `apps/frontend/src/features/programacionSiembra/components/autorizar-programacionSiembra-edit-form.tsx`

When `isAlreadyAuthorized`:
- Show read-only partida info (product header + detalle partida sections)
- Show yellow warning banner (already exists)
- Remove form fields (not needed for de-authorize)

## Verification

```bash
pnpm type-check && pnpm lint
```
