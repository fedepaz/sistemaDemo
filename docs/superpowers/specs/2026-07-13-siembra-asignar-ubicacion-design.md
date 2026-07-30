# Siembra — Asignar Ubicacion Feature Design

**Date:** 2026-07-13
**Status:** Approved
**Scope:** Full stack (backend stubbed), frontend connected

## Context

The siembra feature displays unplanted partidas (via `GET /l-siembra`). The frontend already has a table, view panel, and edit panel with form fields for Ubicacion, Stock Ini, Baja, and Observaciones. However, the mutation is stubbed — the backend endpoint doesn't exist and the frontend submit handler only does `console.log`.

This design completes the siembra feature by:
1. Adding a new `POST /l-siembra/asignar-ubicacion-siembra` endpoint (stubbed backend)
2. Connecting the frontend mutation and submit handler to call it

## Approach

Mirror the extendidos pattern: new endpoint on the siembra controller, own service/repository methods, dedicated shared DTO. No code sharing with the extendidos module.

## Naming Convention

All layers use the `asignarUbicacionSiembra` name consistently:

| Layer | Name |
|-------|------|
| Shared DTO | `AsignarUbiSiembraDto` / `AsignarUbiSiembraDtoSchema` |
| Backend controller | `asignarUbicacionSiembra()` |
| Backend service | `asignarUbicacionSiembra()` |
| Backend repository | `asignarUbicacionSiembra()` |
| Frontend API | `siembraService.asignarUbicacionSiembra()` |
| Frontend mutation | `useSiembraPartidaMutation()` returns `asignarUbicacionSiembra` |
| Frontend handler | `handleAsignarUbicacionSiembra()` |

## Changes

### 1. Shared Package

**`packages/shared/src/schemas/siembra.schema.ts`** — Add new DTO schema:

```ts
export const AsignarUbiSiembraDtoSchema = z.object({
  partida: z.number(),
  ano: z.number(),
  indice: z.number(),
  ubicacion: z.number().int().positive(),
  stock_ini: z.number().int().nonnegative(),
  baja: z.number().int().nonnegative().optional().default(0),
  detalle: z.string().max(30).optional().default(""),
  extendido: z.string().default(""),
  edita: z.string().optional(),
});

export type AsignarUbiSiembraDto = z.infer<typeof AsignarUbiSiembraDtoSchema>;
```

**`packages/shared/src/index.ts`** — Export the new schema (already covered by existing `export * from "./schemas/siembra.schema"`).

### 2. Backend

**`apps/backend/src/modules/legacy/siembra/siembra.controller.ts`** — Add POST endpoint:

```ts
@Post('asignar-ubicacion-siembra')
@RequirePermission({ tableName: 'siembra', action: 'create', scope: 'ALL' })
async asignarUbicacionSiembra(
  @Body(new ZodValidationPipe(AsignarUbiSiembraDtoSchema))
  data: AsignarUbiSiembraDto,
): Promise<void> {
  await this.siembraService.asignarUbicacionSiembra(data);
}
```

**`apps/backend/src/modules/legacy/siembra/siembra.service.ts`** — Add validation method:

```ts
async asignarUbicacionSiembra(data: AsignarUbiSiembraDto): Promise<void> {
  if (data.edita === 'N') {
    throw new BadRequestException('La partida no se puede editar');
  }
  if (!data.ubicacion || data.ubicacion === 0) {
    throw new BadRequestException('Debe seleccionar una ubicación válida');
  }
  await this.siembraRepo.asignarUbicacionSiembra(data);
}
```

**`apps/backend/src/modules/legacy/siembra/repositories/siembra.repository.ts`** — Add stubbed repository method:

```ts
async asignarUbicacionSiembra(data: AsignarUbiSiembraDto): Promise<void> {
  // TODO: Implement legacy MySQL write
  this.logger.warn('asignarUbicacionSiembra not yet implemented');
}
```

### 3. Frontend

**`apps/frontend/src/features/siembra/api/siembraService.ts`** — Add mutation API function:

```ts
asignarUbicacionSiembra: (data: AsignarUbiSiembraDto) => {
  return clientFetch<void>("l-siembra/asignar-ubicacion-siembra", {
    method: "POST",
    body: JSON.stringify(data),
  });
},
```

**`apps/frontend/src/features/siembra/hooks/useSiembraPartidaMutation.ts`** — Replace stub with real mutation:

```ts
export const useSiembraPartidaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, AsignarUbiSiembraDto>({
    mutationFn: siembraService.asignarUbicacionSiembra,
    onSuccess: () => {
      invalidateQueries(queryClient, "siembraPartida");
      queryClient.invalidateQueries({ queryKey: siembraQueryKeys.all() });
      toast.success("Ubicación asignada exitosamente", { duration: 3000 });
    },
    onError: (error) => {
      if (error.message !== "Backend endpoint not yet implemented") {
        toast.error("Error al asignar ubicación");
      }
    },
  });
};
```

**`apps/frontend/src/features/siembra/components/siembra-data-table.tsx`** — Wire submit handler:

```ts
const { mutateAsync: asignarUbicacionSiembra } = useSiembraPartidaMutation();

const handleAsignarUbicacionSiembra = async (formData: AsignarUbiSiembraDto) => {
  if (selectedPartida) {
    try {
      await asignarUbicacionSiembra(formData);
      setSlideOpen(false);
    } catch {}
  }
};
```

### 4. Bug Fix

**Rename** `siembra-dashboad-skeleton.tsx` → `siembra-dashboard-skeleton.tsx` (fix typo). Update import in `index.ts`.

## Query Invalidation Flow

1. User submits assign ubicacion form
2. `handleAsignarUbicacionSiembra` calls `asignarUbicacionSiembra(formData)` mutation
3. Backend endpoint receives request (stubbed for now)
4. On success: `invalidateQueries(queryClient, "siembraPartida")` fires
5. Invalidates query key `["siembra", "partidas"]`
6. `useSiembraPartidas` refetches from `GET /l-siembra`
7. Backend handles returning only unplanted partidas (implementation deferred)

## What This Does NOT Cover

- Backend SQL implementation (stubbed, filled in separately)
- Changes to the GET `/l-siembra` query (backend responsibility)
- New Prisma models or migrations (feature uses legacy MySQL)
- Export functionality (existing stub, not in scope)
- Touch target improvements (deferred)

## Verification

After implementation:
1. `pnpm lint` — 0 new errors
2. `pnpm type-check` — 0 new type errors
3. `pnpm test` — all existing tests pass
4. Manual: navigate to `/siembra`, click a row, fill form, submit → should call POST endpoint
