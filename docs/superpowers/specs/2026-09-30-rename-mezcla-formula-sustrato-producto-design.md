# Rename mezcla → formula, sustrato (entity) → producto + mezcla correctness fixes

## Goal

Rename the `mezcla` entity to `formula` and the `sustrato` entity to `producto` across the
entire stack (code only), and land four targeted correctness fixes. Execution is two-phase:
**Phase 1 — pure mechanical rename (layered, with verification gates); Phase 2 — behavior
changes written directly against the final names.**

## Scope

### What changes
- Prisma models `Mezcla` → `Formula`, `Sustratos` → `Producto` (file renames, relations, FK column `mezclaId` → `formulaId`)
- Shared package: schemas, types, field labels, tests
- Backend: modules `mezcla` → `formula`, `sustratos` → `productos`, API paths, permissions code strings, tests
- Frontend: features `mezclas` → `formulas`, `sustratos` → `productos`, routes, nav, query keys, tests
- Permission entity code strings `mezclas` → `formulas`, `sustratos` → `productos` (+ SQL for the `entities` data)
- Behavior fixes: `GET /:id` arg order, `FormulaRepository` adopts `BaseRepository`, `POST` returns a mapped `FormulaDto`, validation hardening in the shared create schema
- SQL statements for the user to run manually (tables, columns, `entities`)

### What stays the same
- **Guards**: `GET /formula` list stays `programacion_siembra:create`; DataTable `tableName` stays `"programacion_siembra"` (intentional model: a `programacion_siembra` user can always load the list so the selector works; `mezcla/formula` implies `programacion_siembra`, never the reverse)
- **Slideover close / `catch {}` pattern**: untouched in all data tables (global `MutationCache.onError` toast is the designed error surface)
- **No update/delete endpoints, no `GET /:id` frontend consumer**
- **Legacy everything**: `LegacySustrato*`, `SustratoSearch`, `l-sustrato`, `useLegacySustratos`, `LegacySustratoDto(Schema)`, `legacy-mysql/`, legacy SQL
- **siembraPartida *sustrato* references**: `prensadoSustrato`, `sustrato`, `sustratoNombre`, `buildSustratoNombre`, `GENERIC_SUSTRATO_NAME`, literal `'Sustrato Genérico'`
- **Migration SQL files and historical docs/specs/plans**: untouched
- `permissions.guard.spec.ts` keeps `'sustratos'` — it is only an arbitrary mock value in the permissions module

## Naming table

| Old | New |
|---|---|
| model `Mezcla` (table `Mezcla`) | `Formula` (table `Formula`) |
| model `Sustratos` (table `Sustratos`) | `Producto` (table `Producto`) |
| `sustrato1..4Id` + relation `sustrato1..4` | `producto1..4Id` + `producto1..4` |
| `SiembraPartidas.mezclaId` / relation `mezcla` | `formulaId` / `formula` |
| `MezclaSchema/MezclaDto/CreateMezcla*` | `FormulaSchema/FormulaDto/CreateFormula*` |
| `SustratoSchema/SustratoDto/CreateSustrato*` | `ProductoSchema/ProductoDto/CreateProducto*` |
| `modules/mezcla`, `@Controller('mezcla')`, fetch `"mezcla"` | `modules/formula`, `'formula'`, `"formula"` |
| `modules/sustratos`, `@Controller('sustratos')`, fetch `"sustratos"` | `modules/productos`, `'productos'`, `"productos"` |
| `features/mezclas`, route `/mezclas`, `routes.MEZCLAS` | `features/formulas`, `/formulas`, `routes.FORMULAS` |
| `features/sustratos`, route `/sustratos`, `routes.SUSTRATOS` | `features/productos`, `/productos`, `routes.PRODUCTOS` |
| nav ids/labels "Mezclas"/"Sustratos"; perms `mezclas`/`sustratos` | "Fórmulas"/"Productos"; `formulas`/`productos` |
| `mezclaQueryKeys`/`sustratoQueryKeys`; invalidation `createMezcla` | `formulaQueryKeys`/`productoQueryKeys`; `createFormula` |
| `MezclaSelector`, `SustratoDataTable`, `useMezclas`, `sustratoService`, … | `FormulaSelector`, `ProductoDataTable`, `useFormulas`, `productoService`, … |
| field-labels keys `Mezcla/CreateMezcla/Sustrato/CreateSustrato` | `Formula/CreateFormula/Producto/CreateProducto` |

UI copy: "Mezcla" → "Fórmula", "Sustrato 1..4" → "Producto 1..4" **only inside the
formula/producto features**; "Nueva Mezcla" → "Nueva Fórmula", "Crear mezcla" → "Crear
fórmula", toast "Mezcla creada exitosamente" → "Fórmula creada exitosamente", nav
description "Gestión de mezclas de sustratos" → "Gestión de fórmulas", sustratos nav
description "Gestión de sustratos" → "Gestión de productos", statsLabel "Mezclas" →
"Fórmulas". siembraPartida labels keep "Sustrato"/"Prensado"; its `mezclaId`/`mezclaNombre`
labels become "Fórmula".

## Phase 1 — Mechanical rename (layered)

### Layer 1: shared (`packages/shared`)

- Rename `mezcla.schema.ts` → `formula.schema.ts`, `sustratos.schema.ts` → `productos.schema.ts` (+ their specs)
- `field-labels.ts`: rename keys `Mezcla/CreateMezcla/Sustrato/CreateSustrato` → `Formula/CreateFormula/Producto/CreateProducto`; siembraPartida labels `mezclaId`/`mezclaNombre` → "Fórmula"; labels `sustrato`, `prensadoSustrato` untouched
- `siembraPartida.schema.ts`: only `mezclaId` → `formulaId` (lines 38, 102) and `mezclaNombre` → `formulaNombre` (line 40)
- `cuid.schema.ts` line 22: JSDoc `@example mezclaId: requiredCuid("La mezcla")` → `formulaId: requiredCuid("La fórmula")`
- `index.ts` export updates
- Gate: `pnpm --filter @vivero/shared build`

### Layer 2: backend

- Prisma (files): rename `mezcla.prisma` → `formula.prisma`, `sustratos.prisma` → `productos.prisma`
- Prisma (content): models `Mezcla` → `Formula`, `Sustratos` → `Producto`; relation names `sustrato1..4` → `producto1..4` (both files); `siembraPartidas.prisma` `mezclaId`/`mezcla` → `formulaId`/`formula` (keep `prensadoSustrato` and `sustrato` columns); `user.prisma` relations `deleted_mezclas` → `deleted_formulas`, `deleted_sustratos` → `deleted_productos`
- No migration files touched; run `pnpm --filter backend exec prisma generate` (client codegen only, no DB write) or type-check fails on `prisma.formula`
- Modules: `modules/mezcla` → `modules/formula`, `modules/sustratos` → `modules/productos` (controller/service/repository + 3 specs each), `app.module.ts` imports
- API paths: `@Controller('mezcla')` → `'formula'`, `@Controller('sustratos')` → `'productos'`; `RequirePermission` strings `mezclas` → `formulas`, `sustratos` → `productos` (list endpoint keeps `programacion_siembra:create`); guard spec untouched
- `siembraPartidas.service.ts`: `getOrCreateGenericMezcla` → `getOrCreateGenericFormula`, `buildMezclaNombre` → `buildFormulaNombre`, `mezclaNombre` → `formulaNombre`, constant identifiers renamed — **literal `'Sustrato Genérico'` and cuid values `c00000000000000000000001` / `c00000000000000000000002` unchanged** (upsert-by-nombre + fixed id; changing the value creates a duplicate-id crash)
- `test/integration/`: `mezcla.integration.spec.ts` → `formula.integration.spec.ts`, `sustratos.integration.spec.ts` → `productos.integration.spec.ts`, plus `fixtures.ts`, `helpers/mock-factories.ts`, `helpers/create-app.ts`, `programacionSiembra.integration.spec.ts`

### Layer 3: frontend

- `features/mezclas` → `features/formulas`, `features/sustratos` → `features/productos` (all components/hooks/api/tests)
- `app/(dashboard)/mezclas/page.tsx` → `app/(dashboard)/formulas/page.tsx`; `sustratos` → `productos`
- `lib/queryKeys.ts`, `lib/query-invalidation-map.ts`, `lib/config/navigations.ts` (ids, labels, `requiredPermission.table`), `constants/routes.ts` (`MEZCLAS`→`FORMULAS`, `SUSTRATOS`→`PRODUCTOS`), `lib/export/__tests__/export-columns.test.ts`
- `programacionSiembra/components/mezclaSelector.tsx` → `formulaSelector.tsx` (+ `mezaSelector.test.tsx` mock path `@/features/mezclas` → `@/features/formulas`); its default `fieldName` becomes `"formulaId"`
- `siembraPartidas` view form: `mezclaNombre` → `formulaNombre`
- aSembrar: **no changes** — its sustrato refs are siembraPartida/legacy fields

### Hard boundaries (must NOT be renamed)

`LegacySustrato*`, `SustratoSearch`, `l-sustrato`, `useLegacySustratos`, `legacySustratos`,
`LegacySustratoDto`/`LegacySustratoDtoSchema`, `prensadoSustrato`, siembraPartida
`sustrato`/`sustratoNombre`, `buildSustratoNombre`, `GENERIC_SUSTRATO_NAME`, literal
`'Sustrato Genérico'`, all of `legacy-mysql/`, old migration files, `docs/` history.

---

## Phase 2 — Behavior changes

### 1. `GET /:id` argument-order fix

`formula.controller.ts` currently calls `getMezclaById(user.id, id)` while the service
signature is `(id, requesterId)` — the lookup runs with the user id, so the endpoint can
never resolve. Fix the call to `getFormulaById(id, user.id)` **and** fix
`formula.controller.spec.ts` (line 63), which asserts the wrong order
(`toHaveBeenCalledWith('user-1', 'mezcla-1')` → `('<formulaId>', 'user-1')`). Integration
tests mock the service and are unaffected.

### 2. Formula repository adopts `BaseRepository`

`FormulaRepository extends BaseRepository<Formula>` → constructor `(prisma, prisma.formula)`;
inherits `getDevAccounts()`, `softDelete`, `recover`.

**Override** `findAll(requesterId)` and `findById(id, requesterId)` — the base
implementations cannot do the 4-relation include + DTO mapping:

- dev/admin requester (id in `dev_account`): all rows, including `isActive: false` and soft-deleted
- common requester: `deletedAt: null AND isActive: true` (mirroring the base `where` clauses, including `id notIn devIds`)
- both paths apply the existing include of `producto1..4` names and the DTO mapping

Repository spec additions: common user gets only active/non-deleted rows; dev gets
inactive rows; soft-deleted record → `null` for common, returned for dev.

### 3. `POST /formula` returns a real `FormulaDto`

Today `repo.create` returns the raw Prisma row — it has no `sustratoNNombre`/`productoNNombre`
fields, so the response silently violates its declared `MezclaDto` contract (the frontend
only masks this by discarding the body).

- Extract a private `mapRow()` shared by `findAll`, `findById`, and `create` (removes the existing duplicated mapping)
- `create` re-reads the created row with the includes and returns the mapped DTO
- Spec: `create` returns the mapped DTO with names

### 4. Validation hardening (shared `CreateFormulaSchema`)

Applies to both the frontend `zodResolver` and the backend `ZodValidationPipe`:

1. `porcentaje1..4`: `z.number().int().min(0).max(100)` (nullable for 2..4) — rejects `-5`, `33.3`
2. Pair integrity: for N = 2,3,4, `(sustratoNId === null) === (porcentajeN === null)` — "Cada producto debe tener su porcentaje"
3. Distinct slots: non-null ids must be unique — "No se puede repetir el mismo producto"
4. Sum = 100 — unchanged (existing refine)

Messages switch from "sustrato" to "producto" wording ("El producto 1 es requerido", …).
New spec cases in `formula.schema.spec.ts` for each rule.

---

## SQL handoff (user runs manually; nothing applied by the tooling)

```sql
-- 1) Tables (no @@map on these models, so table names = model names)
RENAME TABLE `Mezcla` TO `Formula`, `Sustratos` TO `Producto`;

-- 2) Formula slot columns
ALTER TABLE `Formula`
  RENAME COLUMN `sustrato1Id` TO `producto1Id`,
  RENAME COLUMN `sustrato2Id` TO `producto2Id`,
  RENAME COLUMN `sustrato3Id` TO `producto3Id`,
  RENAME COLUMN `sustrato4Id` TO `producto4Id`;

-- 3) SiembraPartidas FK column (table is `siembra_partdas`, note the @@map typo)
ALTER TABLE `siembra_partdas` RENAME COLUMN `mezclaId` TO `formulaId`;

-- 4) Permission entities — the ONLY permission data change needed
--    (user_permissions links by entityId FK, no string columns to fix)
UPDATE `entities` SET `name`='formulas',  `label`='Fórmulas'  WHERE `name`='mezclas';
UPDATE `entities` SET `name`='productos', `label`='Productos' WHERE `name`='sustratos';

-- 5) Optional cosmetics so a future `prisma migrate diff` stays quiet
ALTER TABLE `Producto` RENAME INDEX `Sustratos_nombre_key` TO `Producto_nombre_key`;
```

Notes:
- MySQL/MariaDB `RENAME TABLE/COLUMN` updates FK definitions automatically. FK
  *constraint* names (e.g. `SiembraPartidas_mezclaId_fkey`) stay stale — cosmetic only;
  MariaDB cannot rename constraints without drop/recreate.
- The generic record (`'Sustrato Genérico'`, cuids `c00000000000000000000001` / `c00000000000000000000002`) is data — untouched, so
  `getOrCreateGenericFormula` keeps finding the existing row. The formula form's producto
  selector will therefore still show "Sustrato Genérico" until a separate data decision is made.
- Existing browser sessions hold the old permission map until re-login.
- Optional for `prisma migrate` history consistency: wrap the SQL in a migration folder and
  run `prisma migrate resolve --applied <name>`; otherwise plain manual SQL (the
  prensadoSustrato precedent).
- SQL and code must land together: nav/guards 403 until the `entities` UPDATE runs.

---

## Verification

After each Phase 1 layer and after Phase 2:

```bash
pnpm lint && pnpm type-check && pnpm test
pnpm --filter backend test:integration
```

After the Prisma schema rename: `pnpm --filter backend exec prisma generate`.

Boundary audit after Phase 1:

```bash
rg -i 'sustrato' apps packages -l   # only allowlisted files (legacy, siembraPartida fields,
                                    # aSembrar, prensadoSustrato, SustratoSearch, docs/)
rg -i 'mezcla' apps packages -l     # empty in code; docs/history only
```

Any unexpected hit = over- or under-rename.

### Test work
- `formula.controller.spec.ts`: fix arg-order expectation
- `formula.schema.spec.ts`: non-integer/negative, pair mismatch, duplicate slots
- `formula.repository.spec.ts`: dev vs common filtering, `create` → mapped DTO
- Rename every existing suite: backend service/repository/controller + integration, frontend
  `formulaService`/data-table/view-form, `export-columns`, `field-labels`
- No tests added for untouched areas (slideover, guards)

### Manual smoke (after SQL)
`/formulas` list + create + view; formula selector inside programación de siembra;
`/productos` page; permissions admin shows "Fórmulas"/"Productos" entities.

## Risks

1. Regex rename hitting a hard boundary — mitigated by the boundary list + post-rename `rg` audit
2. `'Sustrato Genérico'` value must never change (upsert-by-nombre + fixed cuid)
3. SQL/code deployment coupling + stale permission maps in open sessions
4. Possible future `prisma migrate` drift after manual renames (remedy above)
5. The arg-order test fails until the expectation is fixed — fix the test, not the code

## Execution order

1. Phase 1 Layer 1 — shared (+ build gate)
2. Phase 1 Layer 2 — Prisma + backend (+ `prisma generate`, gates)
3. Phase 1 Layer 3 — frontend (+ gates)
4. Boundary audit
5. Phase 2 — arg fix, `BaseRepository`, `create` DTO, validations (+ new tests, gates)
6. Hand the SQL to the user; manual smoke
