# Report — Full flow of the siembra petitions: from the user's screen to the database

Everything below is a description of what the code does today, step by step. No interpretations — just the path of the data.

---

## FLOW 1 — "Asignar ubicación" (extendido)

### Step 1 — The user fills the form
Screen: **Extendidos** table → edit slide-over (`apps/frontend/src/features/extendidos/components/extendido-data-table.tsx:71-85`, form fields in `extendido-edit-form.tsx`).

When the user opens the form, it is **pre-filled** with:

| Form field | Value pre-filled from |
|---|---|
| `partidaId`, `anio`, `indice` | the selected row (its partida header) |
| `ubicacion` | `codigoUbicacion` of the row (user can change it in the "Depósito de Destino" select) |
| `stock_ini` | `parseInt(row.nrocont)` — shown read-only as "Bandejas Recibidas" |
| `baja` | `0` (user can type a number) |
| `detalle` | `""` (empty, max 30 chars) |
| `extendido` | `row.extendido \|\| row.detalle \|\| ""` (the existing observations text; user can edit the "Observaciones" textarea) |
| `edita` | `"S"` |

The row data itself comes from the backend query `GET /l-partidas` → `PartidasRepository.findAll()` → `SELECT * FROM partidas`, and the extendidos screens use `ExtendidosRepository` queries that join `partidas` + `partidas1` + `partidas2`.

### Step 2 — Submit
`handleAsignarUbicacion(formData)` (`extendido-data-table.tsx:87-94`) calls the mutation.

### Step 3 — Hook
`usePartidaMutation` (`extendidos/hooks/usePartidaMutation.ts:15-26`): TanStack Query `useMutation`, `mutationFn = partidaService.asignarUbicacionExtendido`. On success: invalidates the `partidaUbicacion` queries and shows a toast.

### Step 4 — API service → HTTP
`partidaService.asignarUbicacionExtendido` (`extendidos/api/partidaService.ts:11-16`):

```
POST {NEXT_PUBLIC_API_URL}/l-partidas/asignar-extendido
Body: JSON with the form values
Headers: Content-Type: application/json, Authorization: Bearer <accessToken>
```

This goes through `clientFetch` (`src/lib/api/client-fetch.ts:82`), which attaches the token (and refreshes it on 401).

### Step 5 — Controller
`PartidasController.asignarExtendido` (`partidas.controller.ts:36-51`):
- Route: `@Post('asignar-extendido')` on controller `l-partidas`.
- Permission gate: `@RequirePermission({ tableName: 'extendidos', action: 'create', scope: 'ALL' })`.
- Body is parsed with `ZodValidationPipe(AsignarUbiExtendidoDtoSchema)`.

### Step 6 — Zod validation (`packages/shared/src/schemas/partidas.schema.ts:7-31`)
- `partidaId`, `anio`, `indice` required (header).
- `ubicacion`: integer, positive.
- `stock_ini`: integer, ≥ 0.
- `detalle`: string, max 30, default `""`.
- `baja`: integer, ≥ 0, default `0`.
- `extendido`: string, default `""`.
- `edita`: optional string.

If anything fails → HTTP 400, nothing reaches the DB.

### Step 7 — Service (`partidas.service.ts:34-61`)
Additional checks:
- `edita === 'N'` → 400 "La partida no se puede editar".
- `ubicacion` missing or 0 → 400.
- `stock_ini` missing or ≤ 0 → 400.
- `baja > stock_ini` → 400.

Then it builds the object passed to the repository (pure renaming):

```ts
{ partida: data.partidaId, ano: data.anio, indice: data.indice,
  ubicacion, stock_ini, detalle, baja, extendido }
```

and calls `this.partidasRepository.asignarExtendido(repoData)`.

### Step 8 — Repository (`partidas.repository.ts:81-132`)
Opens **one MySQL transaction** and runs exactly two statements:

**Statement 1 — INSERT**

```sql
INSERT INTO partidas2 (
  partida, ano, indice, fecha, ubicacion, stock_ini,
  concepto, detalle, baja, stock,
  f_pr, pr, stxpr, repique, pl_repique,
  f_re, f_pe, pe, stxcont, fin
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
```

Values written:

| Column | Value | Source |
|---|---|---|
| `partida`, `ano`, `indice` | header from the form | user's selected row |
| `fecha` | today `new Date().toISOString().slice(0,10)` | generated in backend |
| `ubicacion` | form value | user's select |
| `stock_ini` | form value | pre-filled from `nrocont` |
| `concepto` | `0` | constant in code |
| `detalle` | form value | user's input |
| `baja` | form value (default `0`) | user's input |
| `stock` | `stock_ini - baja` (line 94) | computed in code |
| `f_pr` | `'0000-00-00'` | zero value |
| `pr` | `'0.00'` | zero value |
| `stxpr`, `repique`, `pl_repique`, `stxcont` | `0` | zero values |
| `f_re`, `f_pe` | `'0000-00-00'` | zero value |
| `pe` | `'0.00'` | zero value |
| `fin` | `''` | empty |

**Statement 2 — UPDATE**

```sql
UPDATE partidas SET extendido = ? WHERE partida = ? AND ano = ? AND indice = ?
```

- `extendido` ← the form's `extendido` text (the "Observaciones" textarea).
- Located by the exact `partida` / `ano` / `indice` header.

**What this flow touches: 1 INSERT into `partidas2`, 1 UPDATE on `partidas`. Nothing else.** It does not touch `partidas1`, stock tables, or any Prisma/new-DB table.

---

## FLOW 2 — "Autorizar siembra" (Programación de Siembra screen)

### Step 1 — The user authorizes a partida
Screen: `/programacion-siembra` → the user opens a row and confirms the authorize form.

The form sends **only the header** (`programacionSiembra-data-table.tsx:65-73`, `119-131`):

```ts
{ partidaId, anio, indice }
```

### Step 2 — Hook
`useProgramacionSiembraAutorizacion` (`programacionSiembra/hooks/useProgramacionSiembraPartidaMutation.ts:10`) → `mutationFn = programacionSiembraService.autorizarSiembra`.

### Step 3 — API service → HTTP
`programacionSiembraService.autorizarSiembra` (`programacionSiembra/api/programacionSiembraService.ts:27-31`):

```
POST {NEXT_PUBLIC_API_URL}/l-partidas/autorizar-siembra
Body: { partidaId, anio, indice }
```

### Step 4 — Controller
`PartidasController.autorizarSiembra` (`partidas.controller.ts:53-73`):
- Route: `@Post('autorizar-siembra')` on controller `l-partidas`.
- Permission gate: `@RequirePermission({ tableName: 'programacion_siembra', action: 'create', scope: 'ALL' })`.
- Body parsed with `ZodValidationPipe(AutorizarSiembraSchema)` (header only: `partidaId`, `anio`, `indice`).
- `@CurrentUser()` captures the authenticated user id.

### Step 5 — Service `autorizarSiembra` (`siembraPartidas.service.ts:313-386`)
1. Looks for an existing row in the **new database**: `siembraPartidas.findFirst({ partidaId, anio, indice, deletedAt: null })`.
2. Branches:
   - **Row exists and `isActive = true`** → HTTP 409 `"Esta partida ya fue autorizada para siembra"`. No write.
   - **Row exists and `isActive = false`** (re-authorize) → `UPDATE siembra_partdas SET isActive = true, profundidadSemilla = 0`.
   - **No row** → creates one (below).
3. Returns the DTO built by `mapToDto` (new-DB row + legacy reads).

### Step 6 — What is CREATED in the new database
`repo.createSiembraPartida(...)` → one `INSERT` into table **`siembra_partdas`** (Prisma model `SiembraPartidas`, `prisma/schema/siembraPartidas.prisma`):

| Column | Value written | Source |
|---|---|---|
| `id` | `cuid()` | generated by Prisma |
| `partidaId`, `anio`, `indice` | header from the form | user's selected row |
| `metodoMaquina` | `true` | constant in code |
| `prensadoSustrato` | `0` | constant in code |
| `profundidadSemilla` | `0` | constant in code |
| `tratamientoSemilla` | `""` | constant in code |
| `sustrato` | not set (null) | — |
| `formulaId` | generic formula (`ensureGenericFormula`) | created/fetched in code |
| `userId` | the authenticated user | `@CurrentUser` |
| `isActive` | `true` | Prisma default |
| `createdAt` / `updatedAt` | now | Prisma defaults |
| `deletedAt`, `deletedByUserId` | null | — |
| `stockLote`, `stockAnio`, `stockEntradas/Salidas*` | not set (null) | — |

Constraints: `@@unique([partidaId, anio, indice])` — one row per partida, ever.

**The authorize flow writes ONLY to the new database.** No legacy MySQL statement runs here.

---

## FLOW 3 — "Desautorizar siembra"

### Step 1 — The user de-authorizes
Same screen `/programacion-siembra`. The handler needs the new-DB row id, which it resolves from a map keyed by `${partidaId}-${anio}-${indice}` (`programacionSiembra-data-table.tsx:133-142`).

### Step 2 — Hook
`useProgramacionSiembraDesautorizacion` (`useProgramacionSiembraPartidaMutation.ts:22`) → `mutationFn = programacionSiembraService.desautorizarSiembra`.

### Step 3 — API service → HTTP
`programacionSiembraService.desautorizarSiembra` (`programacionSiembraService.ts:34-37`):

```
PATCH {NEXT_PUBLIC_API_URL}/siembra-partidas/{id}/desautorizar
```

### Step 4 — Controller
`SiembraPartidasController.desautorizarSiembra` (`siembraPartidas.controller.ts:47-58`):
- Route: `@Patch(':id/desautorizar')` on controller `siembra-partidas`.
- Permission gate: `@RequirePermission({ tableName: 'programacion_siembra', action: 'create', scope: 'ALL' })`.

### Step 5 — Service `desautorizarSiembra` (`siembraPartidas.service.ts:414-454`)
Checks, in order:
1. Row not found → HTTP 404 `"Registro de siembra no encontrado"`.
2. `profundidadSemilla ≠ 0` (already completed) → HTTP 409 `"No se puede desautorizar una partida ya completada"`.
3. `isActive = false` (already de-authorized) → HTTP 409 `"Esta partida ya fue desautorizada"`.

If all checks pass → **one write**:

```ts
UPDATE siembra_partdas SET isActive = false WHERE id = ?
```

**The row is not deleted** — `deletedAt` stays null; only the `isActive` flag flips. Then it returns the refreshed DTO.

**What this flow touches: 1 `UPDATE` on the new DB (`siembra_partdas`). No legacy MySQL statement runs here.** Side effect on lists: the pending query requires `isActive = true`, so the row disappears from **A Sembrar**; authorizing again restores it.

---

## FLOW 4 — "Completar siembra" (A Sembrar screen)

### Step 1 — The user opens the "A Sembrar" screen
`GET /siembra-partidas/pending` (permission `a_sembrar:read`) → `findPendingSiembraPartidas` (`siembraPartidas.service.ts:388-412`) → repo filter (`siembraPartidas.repository.ts:90-119`): `deletedAt = null`, `isActive = true`, **`profundidadSemilla = 0`** (dev accounts excluded).

For each pending row, the backend also reads the legacy data (`mapToDto`, `siembraPartidas.service.ts:172-199`) and exposes:

| DTO field | Legacy column read |
|---|---|
| `cg` | `partidas.cg` |
| `fSiembra` | `partidas.f_siembra` |
| `lote` | `partidas.lote` |
| `anoLote` | `partidas.ano_lote` |
| `item` | `partidas.item` |
| `semxgr` | `partidas.semxgr` |
| `cantidaNroCont` | `partidas.con` |
| `detalleExtendido` | `partidas.extendido` |

### Step 2 — The user fills the form
Screen: **A Sembrar** table (`/a-sembrar`) → "Completar Siembra" slide-over (`a-sembrar-data-table.tsx:43-76`).

Pre-filled on open (`a-sembrar-data-table.tsx:46-63`):

| Form field | Value |
|---|---|
| `partidaId`, `anio`, `indice` | the row's header |
| `cantidaNroCont` | `row.cantidaNroCont ?? 0` |
| `detalleExtendido` | `row.detalleExtendido ?? ""` |
| `lote`, `anoLote`, `item` | `row.lote ?? 0`, `row.anoLote ?? 0`, `row.item ?? 0` |
| `semxgr` | `row.semxgr ?? 0` |
| `cg` | `row.cg ?? 0` |
| `edita` | `"S"` |
| `metodoMaquina`, `profundidadSemilla`, `tratamientoSemilla`, `prensadoSustrato`, `sustrato`, `startTime`, `endTime`, `entityId`, … | technical fields of the new-DB record (edit form `a-sembrar-edit-form.tsx`) |

The user edits what he needs (including `cg`, `cantidaNroCont`, `detalleExtendido`, times) and presses **Completar Siembra** (confirmation dialog summarizes `cg`, `cantidaNroCont`, `detalleExtendido`, `startTime`, `endTime`, …).

### Step 3 — Submit → Hook
`handleCompletar` (`a-sembrar-data-table.tsx:69-76`) → `useASembrarMutation` (`aSembrar/hooks/useASembrarMutation.ts:9-24`): `mutationFn = aSembrarService.completarSiembra(id, data)`; on success invalidates `aSembrar` + `siembraPartida` queries and shows a toast.

### Step 4 — API service → HTTP
`aSembrarService.completarSiembra` (`aSembrar/api/aSembrarService.ts:13-17`):

```
PATCH {NEXT_PUBLIC_API_URL}/l-partidas/asignar-siembra/{id}
Body: JSON with the form values
```

(`id` = the SiembraPartidas record UUID created at authorization time.)

### Step 5 — Controller (`partidas.controller.ts:75-99`)
- Route: `@Patch('asignar-siembra/:id')`.
- Permission gate: `@RequirePermission({ tableName: 'a_sembrar', action: 'create', scope: 'ALL' })`.
- Body validated with `ZodValidationPipe(AsignarUbiSiembraCompletaDtoSchema)`.
- Then it runs **two steps, in order**:
  1. `siembraPartidasService.completarSiembraPartida(id, data, user.id)` → updates the **new database** record (below).
  2. `service.completarSiembraLegacy(data, user.id)` → the legacy MySQL writes (Step 7).

### Step 6 — What is UPDATED in the new database
`completarSiembraPartida` (`siembraPartidas.service.ts:456-499`):
1. Loads the row; not found → 404; `profundidadSemilla ≠ 0` → 409 `"Esta partida ya fue completada"`.
2. **`UPDATE siembra_partdas`** with the form values:

| Column | Value | Source |
|---|---|---|
| `metodoMaquina` | form value | user's form field |
| `prensadoSustrato` | form value | user's form field |
| `profundidadSemilla` | form value | user's form field |
| `tratamientoSemilla` | form value | user's form field |
| `sustrato` | form value | user's form field |
| `formulaId` | form value (only if `formulaId` was sent) | user's form field |

`profundidadSemilla ≠ 0` after this update is what moves the row out of the pending list and into **Siembra Registradas** (see Flow 5), and what blocks a later de-authorize (Flow 3).

### Step 7 — Legacy writes: `completarSiembraLegacy` (`partidas.service.ts:165-211`)
Checks:
- `edita === 'N'` → 400.
- `cg` missing or 0 → 400.

Then it builds the legacy payload:

```ts
{ partida: data.partidaId, ano: data.anio, indice: data.indice,
  f_siembra: new Date(),               // today, set by the backend
  cg: data.cg,
  cantidaNroCont: data.cantidaNroCont,
  lote, anoLote, item, semxgr,
  detalle: data.detalleExtendido }
```

**Before that** (lines 103-132): if `lote === 0` or `anoLote === 0`, it only writes a warning log + an audit event (`anomaly: 'LOTE_OR_ANO_ZERO'`); the flow continues.

Inside `prisma.$transaction`:
1. `this.partidasRepository.asignarSiembra(legacyData)` → the legacy MySQL write (Step 8).
2. If `startTime`/`endTime` exist → **`INSERT` a TaskShift record** in the new DB with `entityId`, `partidaId`, `anio`, `indice`, `startTime`, `endTime`, `employeeUserIds`, `createdBy = requesterId`.

### Step 8 — Repository `asignarSiembra` (`partidas.repository.ts:134-170`)
Opens **one MySQL transaction** and runs exactly two statements:

**Statement 1 — UPDATE `partidas`**

```sql
UPDATE partidas
SET f_siembra = ?, cg = ?, con = ?, extendido = ?
WHERE partida = ? AND ano = ? AND indice = ?
```

| Column | Value | Source |
|---|---|---|
| `f_siembra` | `new Date()` → `toISOString().slice(0,10)` (today) | generated in backend (the DTO no longer carries a date) |
| `cg` | `data.cg` | user's form field |
| `con` | `data.cantidaNroCont` | user's form field |
| `extendido` | `data.detalle` = `detalleExtendido` | user's form field |
| WHERE | `partida`, `ano`, `indice` | header of the row being completed |

**Statement 2 — UPDATE `partidas1`**

```sql
UPDATE partidas1
SET c = ?, g = ?
WHERE lote = ? AND ano_lote = ? AND item = ?
```

| Placeholder | Value | Source |
|---|---|---|
| `c` | `data.semxgr` | `semxgr` of the row (read from `partidas.semxgr`, shown in the form, sent back) |
| `g` | `data.semxgr` | same value |
| WHERE | `lote`, `ano_lote`, `item` | the lot values of the row (`partidas.lote`, `ano_lote`, `item`) |

**What this flow writes in total:**
- New DB: 1 `UPDATE` on `siembra_partdas` (6 fields) + optional 1 `INSERT` of a TaskShift.
- Legacy MySQL: 2 `UPDATE`s (`partidas`, `partidas1`).
- It does not INSERT anywhere in the legacy DB, does not touch `partidas2`, and does not touch the stock summary tables (`st_sem`, `st_sem_item`, `st_sem_movim`).

---

## FLOW 5 — "Siembra Registradas" module (what we show and how)

### Step 1 — Route and data fetch
Screen: `/programacion-siembra/partidas-registradas` → `siembra-partidas-registradas-view.tsx` → hook `useSiembraPartidasRegistradas` (`siembraPartidas/hooks/useSiembraPartidasRegistradas.ts`): TanStack `useSuspenseQuery` → `siembraPartidasRegistradasService.fetchAll` (`api/siembraPartidasRegistradasService.ts`):

```
GET {NEXT_PUBLIC_API_URL}/siembra-partidas
```

### Step 2 — Backend
`SiembraPartidasController.getAllSiembraPartidas` (`siembraPartidas.controller.ts:14-24`):
- Permission gate: `@RequirePermission({ tableName: 'programacion_siembra', action: 'read', scope: 'ALL' })`.
- → `service.getAllSiembraPartidas(user.id)` (`siembraPartidas.service.ts:228-252`) → `repo.findAll` (`siembraPartidas.repository.ts:34-58`).

**Which rows are listed** (repo filter): `deletedAt = null`, `isActive = true`, **`profundidadSemilla ≠ 0`**, dev accounts excluded. Includes `formula` (product names + percentages) and `user` (username).

**How each row is assembled** — `mapToDto` merges three sources:

1. **New-DB record** (`siembra_partdas`): technical fields (`metodoMaquina`, `prensadoSustrato`, `profundidadSemilla`, `tratamientoSemilla`, `sustrato`), `formulaNombre`, `usuarioNombre`, `createdAt`, stock snapshot fields (`stockLote`, `stockAnio`, …).
2. **Legacy MySQL** (`PartidasRepository.findByComposite`, `partidas.repository.ts:30-44`): `partidas` row + `LEFT JOIN articulo` for the species name → `cg`, `fSiembra`, `lote`, `anoLote`, `item`, `semxgr`, `ajuste`, `cantidadGrs` (legacy `cantidad`), `cantidaNroCont` (legacy `con`), `detalleExtendido` (legacy `extendido`), `codigoEspecie`/`nombreEspecie`.
3. **TaskShift** (`taskShiftsRepo.findByPartidaComposite`): `entityNombre`, `startTime`, `endTime`, `empleados[]` (username + first/last name), `createdByNombre` (the "Encargado").

### Step 3 — What the table shows
Columns (`siembraPartidas/components/columns.tsx:10-121`):

| Column header | DTO field |
|---|---|
| Partida | `partidaId` (plus `/ indice` when `indice ≠ 0`) |
| Código | `codigoEspecie` |
| Especie | `nombreEspecie` |
| Lote | `lote` (badge) |
| Cámara | `cg` (from legacy `partidas.cg`) |
| Cant. | `cantidaNroCont` (from legacy `partidas.con`) |
| F. Siembra | `fSiembra` (from legacy `partidas.f_siembra`) |
| Creado | `createdAt` (new DB) |
| Usuario | `usuarioNombre` (who authorized/completed) |

Export columns (same file, lines 123-165) mirror these for CSV/PDF.

The table is **read-only**: the only row action is `onView` (`siembra-partidas-registradas-data-table.tsx:32,53`).

### Step 4 — What the detail slide-over shows
`siembra-partidas-registradas-view-form.tsx` — three tabs:

**Tab "Siembra"** (lines 119-192): Método (`MÁQUINA`/`MANUAL` from `metodoMaquina`), Prensado, Profundidad (cm), Tratamiento (`tratamientoNombre` or code), Sustrato, Cámara Germinación (`cg`), Cantidad Contenedor (`cantidaNroCont`), Fecha Siembra (`fSiembra`), Detalle Extendido (`detalleExtendido`). *(Fórmula row is commented out: "until we implement fórmula".)*

**Tab "Lote"** (lines 195-226): Lote, Año Lote, Germ. Estimada (`ajuste` from legacy), Cantidad gr (`cantidadGrs` from legacy `cantidad`).

**Tab "Turno"** (lines 229-308): Entidad, Hora Inicio / Fin (`startTime`/`endTime`, UTC→local), Encargado (`createdByNombre`), Empleados table (username + nombre).

---

## State of a partida along the flow (new database row)

| State | Condition on `siembra_partdas` | Where it shows up |
|---|---|---|
| Not authorized | no row | only in Programación de Siembra |
| Authorized / pending | row exists, `isActive = true`, `profundidadSemilla = 0` | Programación de Siembra (marked) + **A Sembrar** |
| De-authorized | row exists, `isActive = false` | nowhere (hidden from both lists); can be authorized again (`isActive → true`, `profundidadSemilla → 0`) |
| Completed | row exists, `isActive = true`, `profundidadSemilla ≠ 0` | **Siembra Registradas**; de-authorize blocked (409) |

The legacy MySQL side is only touched by Flow 1 (INSERT `partidas2` + UPDATE `partidas`) and Flow 4 (UPDATE `partidas` + UPDATE `partidas1`). Flows 2, 3 and 5 work exclusively on the new database.

---

## One-page summary

| | Flow 1 — Asignar extendido | Flow 2 — Autorizar | Flow 3 — Desautorizar | Flow 4 — Completar siembra | Flow 5 — Registradas |
|---|---|---|---|---|---|
| Screen | Extendidos → edit | Programación Siembra | Programación Siembra | A Sembrar → Completar | `/programacion-siembra/partidas-registradas` |
| Hook | `usePartidaMutation` | `useProgramacionSiembraAutorizacion` | `useProgramacionSiembraDesautorizacion` | `useASembrarMutation` | `useSiembraPartidasRegistradas` |
| HTTP | `POST /l-partidas/asignar-extendido` | `POST /l-partidas/autorizar-siembra` | `PATCH /siembra-partidas/:id/desautorizar` | `PATCH /l-partidas/asignar-siembra/:id` | `GET /siembra-partidas` |
| Permission | `extendidos:create` | `programacion_siembra:create` | `programacion_siembra:create` | `a_sembrar:create` | `programacion_siembra:read` |
| Backend controller | `partidas.controller.ts:42` | `partidas.controller.ts:59` | `siembraPartidas.controller.ts:53` | `partidas.controller.ts:81` | `siembraPartidas.controller.ts:20` |
| Backend service | `PartidasService.asignarExtendido` | `SiembraPartidasService.autorizarSiembra` | `SiembraPartidasService.desautorizarSiembra` | `completarSiembraPartida` → `PartidasService.completarSiembraLegacy` | `SiembraPartidasService.getAllSiembraPartidas` |
| Writes — new DB | — | INSERT `siembra_partdas` (defaults) or UPDATE `isActive, profundidadSemilla` | UPDATE `siembra_partdas.isActive=false` | UPDATE `siembra_partdas` (6 fields) + optional INSERT TaskShift | — |
| Writes — legacy MySQL | INSERT `partidas2` (20 cols; `concepto=0`, `stock = stock_ini - baja`, `fecha` = today) + UPDATE `partidas.extendido` | — | — | UPDATE `partidas` (`f_siembra`, `cg`, `con`, `extendido`) + UPDATE `partidas1` (`c`, `g` = `semxgr`) | — |
| Key used | `partida + ano + indice` | `partida + ano + indice` (unique) | `id` | `id` (new DB); `partida+ano+indice` / `lote+ano_lote+item` (legacy) | filters, no key |
