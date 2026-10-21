# Design: Formula `nombre` (display name)

**Date:** 2026-10-20
**Status:** Approved (brainstorming)
**Scope:** `apps/backend/prisma` (schema + migration), `apps/backend` (formula, siembraPartidas modules), `packages/shared` (formula schema, field-labels), `apps/frontend` (features/formulas, formulaSelector).

## Context

Formulas have no identity string today. Everywhere a formula is displayed, the UI builds a composition label (`"ProdA (60%) / ProdB (40%)"`) via `siembraPartidas.service.buildFormulaNombre` and `formulaSelector.getCompositionLabel`. Users need a proper, user-defined name to recognize formulas when authorizing/completing siembras.

Decision record from brainstorming:

- **Name replaces composition as the label** everywhere (selector, registradas view, lists); the composition string stays visible only in the formula view-form details.
- **New formulas require the user to type the name** at creation (formulas have no update endpoint — GET/POST/DELETE only; no rename flow now, YAGNI).
- **Existing rows are backfilled with their composition string** as the name, so they look exactly like today. Column stays NOT NULL.
- **50 chars for now** (`VarChar(50)`), polished later if needed.
- **Uniqueness is DB-enforced** (`@unique`), mapped to a friendly 409 (Approach 1). Unique applies to soft-deleted rows too (same trade-off as `productos.nombre`). MySQL CI collation: `"Mix A"` and `"mix a"` collide; the DB decides, no special casing.

## Goals

1. `Formula.nombre`: required, unique, max 50 chars, from DB to frontend.
2. Migration backfills existing formulas with their composition name (truncated + collision-safe).
3. Name becomes the display label wherever formulas appear; composition remains view-form detail only.
4. Duplicate names surface as a form error (409), not a 500.

## Non-Goals

- No formula update/rename endpoint, no edit form.
- No recover/uniqueness exemption for soft-deleted names (name stays occupied).
- No changes to the composition builder's percentage math — the builder is deleted; composition rendering in the view form uses existing DTO product/percentage fields.
- No seed scripts (only migration backfill); no legacy-MySQL involvement (formula lives in Prisma DB).

## Design

### Data layer

`apps/backend/prisma/schema/formula.prisma` — add after `id`:

```prisma
nombre String @unique @db.VarChar(50)
```

Migration `2026MMDDHHMMSS_add_formula_nombre` (generated via `pnpm --filter backend db:migrate:dev`, SQL reviewed):

1. `ALTER TABLE formula ADD COLUMN nombre VARCHAR(50) NULL;`
2. Backfill: per row, build `CONCAT(p1.nombre, ' (', f.porcentaje1, '%)', [' / ' || … for slots 2–4])` joining the four producto relations — same format as the current `buildFormulaNombre` — then `LEFT(..., 50)`. Collisions (from truncation or identical compositions) get deterministic numeric suffixes (`" … (2)"`, `" (3)"`, …) via `ROW_NUMBER()` ordered by `createdAt, id`.
3. `ALTER TABLE formula MODIFY COLUMN nombre VARCHAR(50) NOT NULL;` + unique index.

### Shared package

`packages/shared/src/schemas/formula.schema.ts`:

- `FormulaSchema`: add `nombre: z.string()`.
- `CreateFormulaSchema`: add `nombre: z.string().trim().min(1, "El nombre es requerido").max(50, "Máximo 50 caracteres")` (before the existing refinements; object keys ordered with `nombre` first).

`packages/shared/src/schemas/field-labels.ts`: `nombre: "Nombre"` as the first key of both existing formula sections — `CreateFormula` (create-form labels) and `Formula` (data-table column labels).

### Backend

- `formula.repository.ts`: no mapping change — `nombre` is a scalar column, it flows through `mapRow`'s spread. `FormulaRecord`/`FormulaWithRelations` pick it up from the Prisma type.
- `formula.service.ts` `createFormula`: wrap `repo.create(data)` in try/catch; on Prisma `P2002` (target `nombre`) throw `ConflictException('Ya existe una fórmula con ese nombre')`.
- `siembraPartidas.service.ts`: delete `buildFormulaNombre`; `formulaNombre: row.formula.nombre`. DTO field name `formulaNombre` unchanged (content = the name). The `SiembraPartidasWithRelations` include already loads the formula row.

### Frontend

- `features/formulas/components/formula-create-form.tsx`: required "Nombre" text `Input` at the top of the form (maxLength 50, RHF field on `CreateFormulaSchema` — resolver validates automatically). On submit, a 409 maps to a form-level error (same pattern as other create forms handling conflict messages).
- `features/programacionSiembra/components/formulaSelector.tsx`: option label = `formula.nombre`; delete `getCompositionLabel`.
- Registradas view / any `formulaNombre` display: no frontend change (backend content swap).
- `features/formulas/components/columns.tsx`: add "Nombre" column as the first data column (primary identifier).
- `features/formulas/components/formula-view-form.tsx`: name as the header/title; composition list stays in the details body.
- `features/formulas/api/formulaService.ts` + fixtures: no structural change; fixtures gain `nombre`.

### Testing

- **Shared** — `formula.schema.spec.ts`: `nombre` required, trimmed, max 50 accepted / 51 rejected, empty string rejected.
- **Backend** — formula service spec: `createFormula` maps P2002→409; repository/service fixtures include `nombre`; integration spec: create with duplicate name → 409, reads include `nombre`; siembraPartidas service spec: `formulaNombre` returns `formula.nombre` (builder removed).
- **Frontend** — create-form test: Nombre input renders, required, submitted in payload; selector test: options show `nombre`; columns/data-table tests: Nombre column present; `formulaService` fixtures updated.

## Risks & notes

- Backfill must be deterministic (same DB state → same SQL result); suffixes keyed on `createdAt, id`.
- If a composition is entirely non-ASCII-heavy and truncation lands mid-name, the suffix still guarantees uniqueness.
- `pnpm --filter backend db:migrate:dev` requires a running MariaDB; the migration is reviewed line-by-line before applying.
