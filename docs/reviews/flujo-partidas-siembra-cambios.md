# Review — What this branch changes in the siembra flow: before → after

This document accompanies `docs/reviews/flujo-partidas-siembra.md` (committed on `feat/finish-mezcla`), which describes **what the code did up to that point**. Here we describe **what branch `fix/programacion-siembra-tabs` changes**, section by section, and **how the flow will behave after the PR is merged**.

Style is the same as the reference report: facts only — what the code does, step by step, with file and line references at the current head of this branch (`0b5c8a5`). Where something is unchanged, we say so and point back to the reference document instead of repeating it.

The branch is **not being PR'd yet** — it is under review first; changes may still be requested.

**How to read it:**
- *Before* = the state described in `flujo-partidas-siembra.md` (FLOW numbers refer to that document).
- *After* = the state at this branch's head.
- *After the PR* = the behavior the operator will see once this branch is merged.

---

## 1. Timeline: legacy stock sync

The legacy stock tables (`st_sem_item`, `st_sem`, `st_sem_movim`) are kept in sync with the seed counts written to `partidas1.c`. On this screen flow:

| Event | Date | Commit |
|---|---|---|
| Stock sync wired into the completar-siembra flow | 2026-09-04 | `c08483d`, `e28d25b`, `e536e54` |
| Stock sync removed from the siembra methods | 2026-09-13 | `ab90a09` |
| Stock sync wired again — now inside the **same MySQL transaction** as the grams write | 2026-10-10 | `38a9d45`, `8e695a6` |

Since 2026-10-10, `LegacyStockService.updateStock` recomputes `entrada`/`salida` for `st_sem_item` (per item) and `st_sem` (per lote) from `SUM(partidas1.c)` and `st_sem_movim`, on the **same connection** that just wrote `partidas1`, inside one transaction (`partidas.service.ts:96-107`, `stock/repositories/stock.repository.ts:47-72`).

---

## 2. FLOW 4 — "Completar siembra": what changed

### 2.1 The form: a new field the operator fills in

**Before:** the Completar Siembra slide-over had no grams field. The confirmation dialog summarized `cg`, `cantidaNroCont`, `detalleExtendido`, times (`a-sembrar-data-table.tsx`, `summaryFields`).

**After:**
- New form field **"Gramos Utilizados"** (`cantidadGrs`) with a scale icon, decimal input (`inputMode="decimal"`, `step="any"`), placeholder `Ej: 2.58`, description *"Gramos de semilla cargados en la hoja de siembra"* (`apps/frontend/src/features/aSembrar/components/a-sembrar-edit-form.tsx:218-254`).
- The field is pre-filled from the row when the slide-over opens (`a-sembrar-data-table.tsx:57`) and appears in the confirmation-dialog summary after `cantidaNroCont` (`a-sembrar-data-table.tsx:115`, label *"Gramos utilizados"* from `packages/shared/src/schemas/field-labels.ts:102`).
- The shared DTO now **requires** it: `AsignarUbiSiembraDtoSchema.cantidadGrs = z.number().positive()` (`packages/shared/src/schemas/partidas.schema.ts:58-62`) — empty, zero, or negative submissions are rejected with HTTP 400 before reaching the backend.

**After the PR:** the operator opens the row from **A Sembrar**, types the grams taken from the paper siembra sheet (e.g. `2.58`), and confirms. Nothing else about filling the form changes.

### 2.2 Controller

**Before:** `completarSiembraLegacy(data, user.id)` (`partidas.controller.ts:94`).

**After:** `completarSiembraLegacy(data, user.id, user.tenantId)` — the tenant travels with the caller so the audit event can be attributed (`partidas.controller.ts:94`). Everything else in the controller (route `PATCH /l-partidas/asignar-siembra/:id`, permission `a_sembrar:create`, two-step order: new-DB update first, legacy writes second) is unchanged from the reference doc, FLOW 4 Step 5.

### 2.3 Service `completarSiembraLegacy` (`apps/backend/src/modules/legacy/partidas/partidas.service.ts:63-151`)

**Before** (reference doc, FLOW 4 Step 7): validations on `edita` and `cg`; an anomaly branch that logged an audit event when `lote === 0` or `anoLote === 0`; payload carried `lote, anoLote, item, semxgr` through to the repository; writes ran inside a `prisma.$transaction` with **no stock sync**; an unused `AuditEventEmitter` dependency.

**After**, in order:

| # | What happens now | Line |
|---|---|---|
| 1 | `edita === 'N'` → 400 (unchanged) | `:67-69` |
| 2 | `cg` missing/0 → 400 (unchanged) | `:71-74` |
| 3 | **New:** `semxgr` missing or ≤ 0 → 400 `"La partida no tiene una tasa de semillas válida (semxgr)"` — a row without a seed rate cannot produce a count | `:76-80` |
| 4 | **Compute:** `c = Math.floor(cantidadGrs * semxgr)` — e.g. `2.58 × 243 = 626.94 → 626`. `g` = the operator's `cantidadGrs` as typed. `c` is **never** accepted from the client — it exists only in this payload | `:82`, `:91-92` |
| 5 | **One** `LegacyMysqlService.transaction` opens a real MySQL transaction on a single pooled connection and runs, inside it: (a) `asignarSiembra` → `UPDATE partidas` + `UPDATE partidas1`; (b) `updateStock` → `SUM(partidas1.c)` + `UPDATE st_sem_item` + `UPDATE st_sem`. If any statement fails, everything rolls back — including the grams write | `:96-107` |
| 6 | **Audit:** `emitCrud` with `entityType: 'SIEMBRA'`, `entityId: partida:{id}\|ano:{ano}\|indice:{indice}`, and a body carrying `lote`, `anoLote`, `item`, `cantidadGrs`, `semxgr`, computed `c`, `cg`, `cantidaNroCont`. Emitted **after the transaction commits** and **before** the task shift, so a committed grams/stock change is always audited | `:109-136` |
| 7 | Task shift (new DB, Prisma) only when `startTime`/`endTime` present — unchanged behavior, now explicitly *after* the legacy commit because it lives in a different database | `:138-152` |

**Removed:** the `lote === 0 / anoLote === 0` anomaly branch (its skip-stock behavior no longer exists — stock sync always runs); the `prisma.$transaction` wrapper (it gave no atomicity across the two databases); the unused `AuditEventEmitter` injection was restored later for the new SIEMBRA event (see §6).

**After the PR:** the operator's grams and the computed seed count are written to `partidas1` and the stock totals are re-synced **as one indivisible MySQL operation**, and an audit row records who did it, which partida, and the exact grams/count.

### 2.4 Repository `asignarSiembra` (`partidas.repository.ts:138-186`)

**Before** (reference doc, FLOW 4 Step 8):

```sql
UPDATE partidas1 SET c = ?, g = ? WHERE lote = ? AND ano_lote = ? AND item = ?
```
with **both values set to `semxgr`**, located by the lot key.

**After:**

```sql
UPDATE partidas1 SET c = ?, g = ? WHERE partida = ? AND ano = ? AND indice = ?
```

| Placeholder | Value | Source |
|---|---|---|
| `c` | `Math.floor(cantidadGrs × semxgr)` | computed in the service |
| `g` | `cantidadGrs` | operator's form input |
| WHERE | `partida`, `ano`, `indice` | the header of the row being completed — **not** the lot |

The first statement (`UPDATE partidas … SET f_siembra, cg, con, extendido WHERE partida/ano/indice`) is unchanged from the reference doc. Both statements now run as a single `statements` batch on the caller's connection when one is passed (`partidas.repository.ts:155-186`), and this exact key (`WHERE partida = ? AND ano = ? AND indice = ?`) is pinned by a regression test (`partidas.repository.spec.ts`).

**Why the key matters, in one line:** a partida's header (`partida/ano/indice`) is what the screen edits; the lot columns (`lote/ano_lote/item`) can be shared by several partidas, so locating `partidas1` by lot could touch sibling rows.

**After the PR:** completing a partida updates *its own* `partidas1` row: `g` = grams used, `c` = seeds those grams correspond to.

### 2.5 What this flow writes in total (after the PR)

| Database | Statement | When |
|---|---|---|
| New DB | `UPDATE siembra_partdas` (6 technical fields) | always (step 1 of the controller) |
| New DB | `INSERT` TaskShift | only if start/end times present |
| Legacy MySQL | `UPDATE partidas` (f_siembra, cg, con, extendido) | always — in the legacy transaction |
| Legacy MySQL | `UPDATE partidas1` (`c`, `g` by partida/ano/indice) | always — same transaction |
| Legacy MySQL | `UPDATE st_sem_item`, `UPDATE st_sem` | always — same transaction |
| Audit | 1 `SIEMBRA` CRUD event | after the legacy transaction commits |

Example of the math the backend now performs, matching the legacy seed data:

| Grams (`g`, typed) | `semxgr` (row rate) | Computed `c = floor(g × semxgr)` |
|---|---|---|
| 2.58 | 243 | 626 |
| 44.16 | 40 | 1766 |
| 1.22 | 324 | 395 |

---

## 3. FLOW 2 — "Autorizar siembra": what changed

Only the **form display** changed (`aa7a310`, 2026-10-10):

**Before:** the authorize slide-over showed two read-only rows, `C` and `G`, next to `Sem / Gr`, `Año / Lote`, and `Item`.

**After:** the `C` and `G` rows were removed from `autorizar-programacionSiembra-edit-form.tsx`. Both values come from `partidas1.c/g` — columns written by the completar flow — and are not meaningful at authorization time, which happens before any grams are entered.

**Unchanged:** the authorize payload is still only `{ partidaId, anio, indice }`; it still writes only to the new database (reference doc, FLOW 2).

**Also on this screen:** the two table columns that display `c` and `g` were renamed from the bare headers `C` and `G` to **"Cant. Semillas"** and **"Gramos"** (`programacionSiembra/components/columns.tsx:127-141`, commit `0b5c8a5`). The values shown are unchanged.

**After the PR:** the authorization screen shows the lot and rate; grams and counts appear later, at completar time.

---

## 4. FLOW 5 — "Siembra Registradas": what changed

One data-provenance fix (`9f5e143`, 2026-10-10):

**Before:** the DTO field `cantidadGrs` was read from the legacy column `partidas.cantidad` — a column the current flow never writes (`siembraPartidas.service.ts:197`, old value). The detail slide-over's "Cantidad (gr)" row therefore did not reflect the completar flow.

**After:**
- `PartidasRepository.findByComposite` now `LEFT JOIN partidas1` on the partida header and selects `l.g` (`partidas.repository.ts:36-44`); `LegacyPartidas` gained the `g` field (`partidas.interface.ts:67`).
- The DTO maps `cantidadGrs: Number(legacyData.g)` (`siembraPartidas.service.ts:197`).
- The "Cantidad (gr)" row in the Lote tab (`siembra-partidas-registradas-view-form.tsx:223-224`) now shows exactly the grams the operator typed at completar time. The `Germ. Estimada` row continues to show `ajuste`, read from `partidas.ajuste` via `p.*`.
- The temporary TODO comment that asked where `ajuste`/`cantidadGrs` came from was removed once the provenance was fixed.

**After the PR:** grams entered on the A Sembrar screen are the same grams displayed in Registradas.

---

## 5. Headers and typography on the same screens (display-only)

Five commits polish the presentation of the siembra screens without touching data:

| Commit | Date | What it does |
|---|---|---|
| `1825a4c` | 2026-10-05 | Simplifies the Registradas view header (identity + partida number) |
| `eace018` | 2026-10-05 | Aligns the Registradas header with shared helpers |
| `de4fa6d` | 2026-10-05 | Uses shared `formatPartidaNumber` / `formatSpecies` helpers for headers and slide-over titles across the flow |
| `8b25d8c` | 2026-10-05 | Plan document for the header-helpers work |
| `3dd8987` | 2026-10-05 | Typography, contrast and wrap fixes on the partida headers |

---

## 6. Audit: what gets recorded, and where

Two audit mechanisms coexist, at different layers:

| Layer | What it records | Behavior |
|---|---|---|
| Global HTTP interceptor (`audit-crud.interceptor.ts`, registered in `app.module.ts`) | Every `PATCH /l-partidas/asignar-siembra/:id` — request body, user, IP, duration. Entity type resolves to `UNKNOWN` for this URL path | Logs only on success; errors are handled by the exception filter |
| **New:** service-level `SIEMBRA` event (`partidas.service.ts:109-136`, added by `ffd6d1d` + `089b4e2`) | The business facts the HTTP layer cannot know: computed `c`, grams, lot, and a composite id `partida:{id}\|ano:{ano}\|indice:{indice}`. `tenantId` comes from the authenticated user | Emitted right after the legacy transaction commits, before the task shift, so a committed grams/stock change is never left unaudited |

Both fire on a successful completion by design: the interceptor records the HTTP request, the service records the business result. The service event is synchronous and fire-and-forget — it cannot fail the request.

---

## 7. After the PR — the flow, end to end

1. The operator authorizes a partida (FLOW 2 — unchanged apart from §3).
2. The row appears in **A Sembrar**. The operator opens **Completar Siembra**, fills the form, and types the **grams from the paper siembra sheet** into *Gramos Utilizados*.
3. On submit, Zod rejects anything missing/zero/negative; the backend additionally rejects a row with no valid `semxgr`.
4. The backend computes `c = floor(grams × semxgr)` and, **in one MySQL transaction**, writes `partidas1.g` (the grams), `partidas1.c` (the count), updates `partidas`, and re-syncs `st_sem_item`/`st_sem` salidas. Failure anywhere rolls all of it back.
5. A `SIEMBRA` audit event records user, tenant, partida, grams, and count; the task shift (if times were given) is created in the new database afterwards.
6. **Registradas** shows the same grams in "Cantidad (gr)".

Nothing changes for FLOW 1 (extendido), FLOW 3 (desautorizar), or FLOW 5's listing behavior.

---

## 8. Full branch inventory — everything this branch carries (39 commits vs `dev`)

For review completeness: every commit on `fix/programacion-siembra-tabs` since it split from `dev`, grouped by area. The siembra-flow rows (group A) are the deep-dive above.

### A. Siembra flow — grams, stock, audit (deep-dive in §§1-4, 6)

| Commit | Date | What it does |
|---|---|---|
| `aa7a310` | 2026-10-10 | Removes C/G rows from the authorize form; adds a provenance TODO in Registradas (removed by the next commit) |
| `9f5e143` | 2026-10-10 | Registradas `cantidadGrs` now read from `partidas1.g` (join added); TODO removed |
| `d05a195` | 2026-10-10 | Shared DTO requires `cantidadGrs` (positive number) + tests + label |
| `38a9d45` | 2026-10-10 | Backend writes `g`/`c` keyed by partida/ano/indice, re-enables stock sync, deletes dead code |
| `8e695a6` | 2026-10-10 | Single legacy MySQL transaction spans grams write + stock sync |
| `a57a50b` | 2026-10-10 | Frontend "Gramos Utilizados" field + confirm-dialog summary |
| `ffd6d1d` | 2026-10-10 | `SIEMBRA` audit event emitted from the service |
| `089b4e2` | 2026-10-10 | Audit moved before task shift; `semxgr > 0` guard; repository SQL regression tests |
| `0b5c8a5` | 2026-10-11 | Column headers `C`/`G` renamed to `Cant. Semillas`/`Gramos` in the programación table |

### B. Siembra screens — headers and typography

| Commit | Date | What it does |
|---|---|---|
| `1825a4c` | 2026-10-05 | Registradas header simplification |
| `eace018` | 2026-10-05 | Registradas header aligned with shared helpers |
| `de4fa6d` | 2026-10-05 | Shared header/slide-over title helpers applied |
| `8b25d8c` | 2026-10-05 | Plan document for that refactor |
| `3dd8987` | 2026-10-05 | Header typography/contrast/wrap fixes |

### C. Rename "mezcla" → "fórmula", "sustratos" → "productos"

| Commit | Date | What it does |
|---|---|---|
| `6c15cc9` | 2026-09-30 | The rename itself (frontend, backend, shared) |
| `f520cdf` | 2026-10-01 | `FormulaRepository` extends `BaseRepository` |
| `4e85b7f` | 2026-10-01 | Shared validation: formula percentages and slot pairing |
| `de26c3e` | 2026-10-01 | DB migration renaming the legacy tables (handoff SQL) |
| `1eba351` | 2026-10-01 | QA docs: integration suite list updated |
| `9c12bf1` | 2026-10-01 | Build: upper bounds added to pnpm overrides (security) |
| `89375d5` / `9d7e020` / `a5570c7` / `3901a82` | 2026-10-01 | check-first `ensureGenericFormula`: spec + plan + refactor + tests |
| `5d9871f` / `b7b4159` / `948105e` / `ca264bc` / `9bc533b` / `2aa2784` | 2026-10-01 | Spec/plan/docs for the producto+formula full-CRUD feature |
| `0e5fdea` / `4154a4b` | 2026-10-01 | Final review nits applied; edit-submission test added |

### D. Productos, fórmulas y entidades — CRUD, estado y borrado

| Commit | Date | What it does |
|---|---|---|
| `24322cc` | 2026-10-01 | Formula delete endpoint + list read permission alignment |
| `0550868` | 2026-10-01 | Frontend formula delete action |
| `898945a` | 2026-10-01 | Producto soft-delete endpoint |
| `3ecef6e` | 2026-10-01 | Frontend producto edit + delete actions |
| `23640da` | 2026-10-03 | Inactive (deleted) state shown for productos and formulas |
| `e912d1c` | 2026-10-03 | Deletion date and deleter shown for productos and formulas |
| `f84c63d` | 2026-10-03 | Entities module: full CRUD, view, system-entity hardening |

Count check: group A = 9, group B = 5, group C = 18, group D = 7 → **39** commits, matching `git log dev..HEAD | wc -l`.

---

## 9. What is deliberately NOT part of this change

Known items consciously left out (each was reviewed; none blocks the PR):

- **Cross-database ordering:** the controller still updates the new-DB record first, then runs the legacy transaction. A legacy failure leaves the new-DB update applied (the two databases cannot share a transaction). The legacy side itself is now atomic.
- **Connection pattern:** the optional-`conn` parameter on the stock/partidas repositories is the convention for multi-statement legacy writes ("always pass the transaction's connection"); a follow-up can make `conn` required on internal paths.
- **Dead code:** `logger` and `siembraPartidaService` in `PartidasService` have no current callers; `programacionSiembraService.asignarUbicacionSiembra` posts to a route that does not exist. Cleanup deferred.
- **Docs:** the shared package has no `type-check` script yet (its type check runs as `tsc -p tsconfig.json --noEmit`).
- **Tests at the time of writing:** shared 229, backend 353, frontend 314 unit tests, plus the programacionSiembra integration suite — all passing; `pnpm lint` 0 errors, `pnpm type-check` clean.

---

*Generated for branch `fix/programacion-siembra-tabs` at head `0b5c8a5`. Baseline report: `docs/reviews/flujo-partidas-siembra.md` (on `feat/finish-mezcla`); reconcile the two after the merge if either has moved.*
