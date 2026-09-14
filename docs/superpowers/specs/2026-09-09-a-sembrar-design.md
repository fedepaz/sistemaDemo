# "A Sembrar" Feature Design

## Overview

A two-person sowing workflow where User A authorizes partidas for sowing (filling preliminary fields), and User B completes the technical assignment (pressure, depth, treatment, task shift). The two users have completely separate permissions and UIs.

## Data Flow

```
User A (siembra:read + siembra:create)
  │
  ├─ Sees: Legacy siembra table (pending partidas from MySQL via l-siembra)
  ├─ Action: Selects row → fills camera, date, quantity, lot → "Autorizar"
  │
  └─ Creates: SiembraPartidas record (partidaId, anio, indice, userId, generic mezcla, defaults)
                    │
                    ▼
User B (a_sembrar:read + a_sembrar:update)
  │
  ├─ Sees: SiembraPartidas WHERE profundidadSemilla = '0' (pending completion)
  ├─ Action: Opens row → fills pressure, depth, treatment, mezcla, task shift → "Completar"
  │
  └─ Updates: SiembraPartidas (technical fields) + creates TaskShift (startTime, endTime, employees)
```

**User tracking:**
- User A → `SiembraPartidas.userId`
- User B → `TaskShift.createdByUserId` + `TaskShift.employees[]`

## Backend Changes

### 1. New Entity Registration

Add `a_sembrar` to the `entities` table (via seed or migration).

### 2. New Endpoint: `GET /siembra-partidas/pending`

**Controller:** `SiembraPartidasController`

```
@Get('pending')
@RequirePermission({ tableName: 'a_sembrar', action: 'read', scope: 'ALL' })
async getPendingSiembraPartidas(@CurrentUser() user: AuthUser): Promise<SiembraPartidaDto[]>
```

**Service:** `SiembraPartidasService.getPendingSiembraPartidas(requesterId)`

- Queries `SiembraPartidas` where `profundidadSemilla = 0` (default = pending)
- Joins legacy data via `PartidasRepository.findByComposite()` for species info
- Joins `TaskShiftsRepository.findByPartidaComposite()` (null for pending)
- Returns `SiembraPartidaDto[]`

**Repository:** `SiembraPartidasRepository.findPendingSiembraPartidas(requesterId)`

- Custom query: `findAll` variant with `where: { profundidadSemilla: 0 }`
- Includes `mezcla` and `user` relations

### 3. New Endpoint: `POST /l-partidas/autorizar-siembra`

**Controller:** `PartidasController`

```
@Post('autorizar-siembra')
@RequirePermission({ tableName: 'siembra', action: 'create', scope: 'ALL' })
async autorizarSiembra(
  @Body(new ZodValidationPipe(PartidaHeaderSchema)) data: PartidaHeader,
  @CurrentUser() user: AuthUser,
)
```

**Service:** `SiembraPartidasService.autorizarSiembra(data, requesterId)`

- Creates a minimal `SiembraPartidas` record:
  - `partidaId`, `anio`, `indice` from input
  - `userId` = requesterId (User A)
  - `mezclaId` = generic mezcla (via `getOrCreateGenericMezcla()`)
  - `metodoMaquina = true` (default)
  - `presionSemilla = 0` (default)
  - `profundidadSemilla = 0` (default — marks as pending)
  - `tratamientoSemilla = ""` (default)
- Returns created `SiembraPartidaDto`

### 4. Refactor Endpoint: `POST → PATCH /l-partidas/asignar-siembra/:id`

**Controller:** `PartidasController`

```
@Patch('asignar-siembra/:id')
@RequirePermission({ tableName: 'a_sembrar', action: 'update', scope: 'ALL' })
async completarSiembra(
  @Param('id') id: string,
  @Body(new ZodValidationPipe(AsignarUbiSiembraCompletaDtoSchema)) data: AsignarUbiSiembraCompletaDto,
  @CurrentUser() user: AuthUser,
)
```

**Service:** `SiembraPartidasService.completarSiembraPartida(id, data, requesterId)`

- Validates `SiembraPartida` exists via `repo.findById(id, requesterId)` (from `BaseRepository`)
  - If not found → throw `NotFoundException`
- Validates it's still pending (`profundidadSemilla = 0`)
  - If already completed → throw `ConflictException` with message "Esta partida ya fue completada"
- Updates technical fields: `metodoMaquina`, `presionSemilla`, `profundidadSemilla`, `tratamientoSemilla`, `mezclaId`
- Calls legacy `asignarSiembra` logic to write camera/date/quantity/lot to MySQL (reuses existing transaction)
- Creates `TaskShift` via `TaskShiftsRepository` with `createdByUserId = requesterId` (User B)
- Returns updated `SiembraPartidaDto`

### 5. Module Changes

**`SiembraPartidasModule`:** Export `SiembraPartidasService` (already exported). Import `TaskShiftsModule` (already imported).

**`PartidasModule`:** Add `SiembraPartidasModule` to imports (to access `SiembraPartidasService`).

## Frontend Changes

### 1. New Feature: `apps/frontend/src/features/aSembrar/`

```
aSembrar/
  index.ts
  api/
    aSembrarService.ts
  hooks/
    useASembrarPartidas.ts
    useASembrarMutation.ts
  components/
    ASembrarDashboard.tsx
    a-sembrar-view.tsx
    a-sembrar-data-table.tsx
    a-sembrar-edit-form.tsx
    columns.tsx
```

### 2. API Service (`aSembrarService.ts`)

```ts
export const aSembrarService = {
  fetchPending: () =>
    clientFetch<SiembraPartidaDto[]>("siembra-partidas/pending", { method: "GET" }),

  completarSiembra: (id: string, data: AsignarUbiSiembraCompletaDto) =>
    clientFetch<void>(`l-partidas/asignar-siembra/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
}
```

### 3. Hooks

**`useASembrarPartidas.ts`:**
```ts
useSuspenseQuery<SiembraPartidaDto[]>({
  queryKey: aSembrarQueryKeys.all(),
  queryFn: aSembrarService.fetchPending,
})
```

**`useASembrarMutation.ts`:**
```ts
useMutation<void, Error, { id: string; data: AsignarUbiSiembraCompletaDto }>({
  mutationFn: ({ id, data }) => aSembrarService.completarSiembra(id, data),
  onSuccess: () => {
    invalidateQueries(queryClient, "aSembrar");
    toast.success("Siembra completada exitosamente", { duration: 3000 });
  },
})
```

### 4. Data Table (`a-sembrar-data-table.tsx`)

- Renders `DataTable` with `aSembrarColumns`
- `tableName="a_sembrar"` for permission-aware actions
- `onEdit` opens `SlideOverForm` with `ASembrarEditForm`
- Toolbar: week filter (same pattern as siembra)

### 5. Edit Form (`a-sembrar-edit-form.tsx`)

A new form showing only the **technical fields** that User B completes:

- Producto header (codigoEspecie, nombreEspecie) — read-only context
- Método (metodoMaquina) — Switch toggle
- Presión de Semilla (presionSemilla) — integer input
- Profundidad de Semilla (profundidadSemilla) — text input
- Tratamiento (tratamientoSemilla) — TratamientoSearch component
- Mezcla (mezclaId) — MezclaSelector (currently commented out, enable it)
- TaskShift component (startTime, endTime, employees)
- Submit button: "Completar Siembra"

The form receives the pending `SiembraPartidaDto` and populates defaults from it.

### 6. Columns (`columns.tsx`)

Columns for `SiembraPartidaDto` (pending view):
1. **partidaId** — `#{partidaId}` with indice
2. **codigoEspecie** — monospace code
3. **nombreEspecie** — species name
4. **cantidaNroCont** — quantity (pre-filled by User A)
5. **fSiembra** — sowing date (pre-filled by User A)
6. **usuarioNombre** — User A who authorized
7. ** Actions** — Edit button (completar)

### 7. Navigation (`navigations.ts`)

New entry under "Partidas" group:
```ts
{
  title: "A Sembrar",
  href: ROUTES.A_SEMBRAR,
  icon: Sprout,
  requiredPermission: { table: "a_sembrar", action: "read" },
}
```

### 8. Permissions (`table-meta.ts`)

```ts
a_sembrar: { icon: Sprout },
```

## Shared Schema Changes

### `fieldLabels.ts`

Add `ASembrar` section:
```ts
ASembrar: {
  partidaId: "Partida",
  codigoEspecie: "Código",
  nombreEspecie: "Especie",
  cantidaNroCont: "Cantidad",
  fSiembra: "F. Siembra",
  usuarioNombre: "Autorizado por",
  metodoMaquina: "Método",
  presionSemilla: "Presión",
  profundidadSemilla: "Profundidad",
  tratamientoSemilla: "Tratamiento",
  tratamientoNombre: "Tratamiento",
  mezclaId: "Mezcla",
  mezclaNombre: "Mezcla",
  entityId: "Entidad",
  startTime: "Hora Inicio",
  endTime: "Hora Fin",
  employeeUserIds: "Empleados",
},
```

### `queryKeys.ts`

```ts
aSembrarQueryKeys: {
  all: () => ["aSembrar"],
},
```

### `query-invalidation-map.ts`

```ts
aSembrar: [
  aSembrarQueryKeys.all(),
],
```

### `routes.ts`

```ts
A_SEMBRAR: "/a-sembrar",
```

## Siembra Feature Refactor

### Edit Form (`siembra-edit-form.tsx`)

Refactor to show **only preliminary fields** for the authorization step:

- Producto header (codigoEspecie, nombreEspecie) — read-only context
- Camera (cg) — Select from `useDepositos()`
- Fecha de Siembra (f_siembra) — date input
- Bandejas Confirmadas (cantidaNroCont) — number input
- Lote (lote) — number input
- Año Lote (anoLote) — number input
- Item (item) — number input
- Submit button label: "Autorizar Siembra"

**Remove** these fields from `siembra-edit-form` (they move to `a-sembrar-edit-form`):
- Cantidad (gr), Ajuste, Presión de Semilla, Profundidad de Semilla
- Tratamiento, Método toggle, TaskShift, Observaciones

### API Service (`siembraService.ts`)

Add new method:
```ts
autorizarSiembra: (data: PartidaHeader) =>
  clientFetch<SiembraPartidaDto>("l-partidas/autorizar-siembra", {
    method: "POST",
    body: JSON.stringify(data),
  }),
```

### Mutation Hook (`useSiembraPartidaMutation.ts`)

Update the existing mutation OR add a new `useSiembraAutorizacion` hook:
```ts
useMutation<SiembraPartidaDto, Error, PartidaHeader>({
  mutationFn: siembraService.autorizarSiembra,
  onSuccess: () => {
    invalidateQueries(queryClient, "siembraPartida");
    toast.success("Partida autorizada para siembra", { duration: 3000 });
  },
})
```

### Data Table (`siembra-data-table.tsx`)

Add a new action button "Autorizar" (gated by `siembra:create`) that:
1. Opens the slide-over with the simplified `SiembraEditForm`
2. On submit, calls the autorizar mutation with `(partidaId, anio, indice)`
3. The form does NOT send camera/date/quantity to the backend — those are legacy fields written by the `asignar-siembra` flow. The authorization step only creates the `SiembraPartidas` record with the partida header.

**Note:** The preliminary fields (camera, date, quantity, lot) shown in the authorization form are read-only context from the legacy database. The actual legacy data assignment happens when User B completes the assignment via the `PATCH /l-partidas/asignar-siembra/:id` endpoint (which calls the existing `asignarSiembra` logic that writes to legacy MySQL). The authorization step's purpose is to "claim" the partida in `SiembraPartidas` so User B can see it.

## Testing Strategy

- Backend integration tests for new endpoints (mock DB operations)
- Frontend component tests for `a-sembrar-data-table` and `a-sembrar-edit-form`
- Verify permission gating: User A cannot see `a_sembrar`, User B cannot see `siembra`
- Verify pending filter: completed records disappear from User B's view
