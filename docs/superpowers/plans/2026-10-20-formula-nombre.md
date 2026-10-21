# Formula `nombre` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a required, unique, 50-char `nombre` to Formula, backfill existing rows with their composition string, and make it the display label from DB to frontend.

**Architecture:** Prisma column `nombre String @unique @db.VarChar(50)` with a 3-step migration (add → backfill composition names → enforce NOT NULL + unique). Shared Zod schemas carry validation; formula service maps Prisma `P2002` to a 409; `siembraPartidas.formulaNombre` reads the column instead of building the composition string; frontend shows the name in selector, table, and view form.

**Tech Stack:** Prisma + MariaDB, NestJS 11, Zod (`@vivero/shared`), Next.js 16 + RHF/zodResolver + TanStack Query, Jest/Vitest.

**Spec:** `docs/superpowers/specs/2026-10-20-formula-nombre-design.md`

## Global Constraints

- Column: `nombre String @unique @db.VarChar(50)` on model `Formula` (table `Formula`).
- Composition backfill format = current `buildFormulaNombre`: parts `"Prod (60%)"` joined with `" + "`, e.g. `"Turf (60%) + Perlita (40%)"`, truncated to 50 chars.
- Duplicate-name API error: HTTP 409, message exactly `Ya existe una fórmula con ese nombre`.
- Shared validation: `trim()`, min 1 (`El nombre es requerido`), max 50 (`Máximo 50 caracteres`).
- Frontend follows design tokens from `globals.css`; no arbitrary values; slide-over children use no `md:` prefixes (see `docs/agents/ux-ui-agent.md`).
- Verification order before final: `pnpm lint && pnpm type-check && pnpm test`, then `pnpm --filter backend test:integration`.
- **Pre-work already applied (committed with Task 1):** schema change in `formula.prisma`; `ensureGenericFormula` upsert `create` gains `nombre: 'Genérica'`.

---

### Task 1: Migration with backfill (user-executed against local MariaDB)

**Files:**
- Modify: `apps/backend/prisma/schema/formula.prisma` (done — verify line 4: `nombre String @unique @db.VarChar(50)`)
- Create: `apps/backend/prisma/migrations/<timestamp>_add_formula_nombre/migration.sql`

**Interfaces:**
- Produces: DB column `Formula.nombre` VARCHAR(50) NOT NULL UNIQUE; Prisma client regenerated with `nombre` on the `Formula` model. Tasks 2–7 rely on the regenerated types.

- [ ] **Step 1: Create the migration without applying**

```bash
pnpm --filter backend exec prisma migrate dev --create-only --name add_formula_nombre
```

Expected: Prisma creates `apps/backend/prisma/migrations/<timestamp>_add_formula_nombre/migration.sql` (do NOT answer the reset prompt — create-only never applies).

- [ ] **Step 2: Replace the generated SQL entirely with the canonical backfill**

```sql
-- Formula.nombre: required unique display name (VarChar(50)).
-- Backfills existing rows with their composition string (buildFormulaNombre format):
--   "Turf (60%) + Perlita (40%)", truncated to 50 chars, collision-safe suffixes.

-- 1) Add nullable column
ALTER TABLE `Formula` ADD COLUMN `nombre` VARCHAR(50) NULL;

-- 2) Backfill: composition string, truncated to 50 chars
UPDATE `Formula` f
JOIN `Producto` p1 ON p1.`id` = f.`producto1Id`
LEFT JOIN `Producto` p2 ON p2.`id` = f.`producto2Id`
LEFT JOIN `Producto` p3 ON p3.`id` = f.`producto3Id`
LEFT JOIN `Producto` p4 ON p4.`id` = f.`producto4Id`
SET f.`nombre` = LEFT(
  CONCAT(
    p1.`nombre`, ' (', f.`porcentaje1`, '%)',
    IF(f.`producto2Id` IS NOT NULL AND f.`porcentaje2` IS NOT NULL,
       CONCAT(' + ', p2.`nombre`, ' (', f.`porcentaje2`, '%)'), ''),
    IF(f.`producto3Id` IS NOT NULL AND f.`porcentaje3` IS NOT NULL,
       CONCAT(' + ', p3.`nombre`, ' (', f.`porcentaje3`, '%)'), ''),
    IF(f.`producto4Id` IS NOT NULL AND f.`porcentaje4` IS NOT NULL,
       CONCAT(' + ', p4.`nombre`, ' (', f.`porcentaje4`, '%)'), '')
  ), 50);

-- 3) Deduplicate (identical compositions / truncation) with deterministic suffixes
UPDATE `Formula` f
JOIN (
  SELECT `nombre`,
         ROW_NUMBER() OVER (PARTITION BY `nombre` ORDER BY `createdAt`, `id`) AS rn
  FROM `Formula`
) d ON d.`nombre` = f.`nombre` AND d.rn > 1
SET f.`nombre` = CONCAT(
  LEFT(f.`nombre`, 50 - LENGTH(CONCAT(' (', d.rn, ')'))),
  ' (', d.rn, ')'
);

-- 4) Enforce NOT NULL + uniqueness (index name matches Prisma convention)
ALTER TABLE `Formula` MODIFY COLUMN `nombre` VARCHAR(50) NOT NULL;
CREATE UNIQUE INDEX `Formula_nombre_key` ON `Formula`(`nombre`);
```

- [ ] **Step 3: Apply the migration**

```bash
pnpm --filter backend db:migrate:dev
```

Expected: migration applies; Prisma regenerates the client (Formula model now has `nombre`).

- [ ] **Step 4: Verify DB state**

```bash
pnpm --filter backend db:status
```

Expected: `Database schema is up to date.` Sanity-check backfilled values in Prisma Studio (`pnpm --filter backend db:studio`): every `Formula` row has a non-empty `nombre` ≤ 50 chars.

- [ ] **Step 5: Commit (includes pre-work schema + ensureGenericFormula + spec fixes)**

```bash
git add apps/backend/prisma/schema/formula.prisma apps/backend/prisma/migrations apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts docs/superpowers/specs/2026-10-20-formula-nombre-design.md
git commit -m "feat(backend): add formula nombre column with backfilled composition names"
```

---

### Task 2: Shared schemas + field labels (TDD)

**Files:**
- Modify: `packages/shared/src/schemas/formula.schema.ts:6-43`
- Modify: `packages/shared/src/schemas/field-labels.ts:47-56` (CreateFormula) and `:187-197` (Formula)
- Test: `packages/shared/src/schemas/__tests__/formula.schema.spec.ts`
- Test: `packages/shared/src/schemas/__tests__/field-labels.spec.ts:55-64`

**Interfaces:**
- Produces: `FormulaSchema.nombre: string`; `CreateFormulaDto.nombre: string` (trimmed, 1–50); `fieldLabels.Formula.nombre = "Nombre"`, `fieldLabels.CreateFormula.nombre = "Nombre"`. Tasks 3–7 rely on `nombre` existing on both DTOs.

- [ ] **Step 1: Write failing tests in `formula.schema.spec.ts`**

Add `nombre: "Mix A"` to the top-level `valid` object (line ~5) and to the `minimal` object inside the first `FormulaSchema` test. Then append:

```ts
describe("FormulaSchema — nombre", () => {
  it("requires nombre", () => {
    const { nombre, ...withoutNombre } = valid;
    expect(FormulaSchema.safeParse(withoutNombre).success).toBe(false);
  });

  it("accepts nombre and keeps it", () => {
    expect(FormulaSchema.parse(valid).nombre).toBe("Mix A");
  });
});

describe("CreateFormulaSchema — nombre", () => {
  const base = {
    producto1Id: "clx1234567890abcdef123467",
    porcentaje1: 100,
    producto2Id: null,
    porcentaje2: null,
    producto3Id: null,
    porcentaje3: null,
    producto4Id: null,
    porcentaje4: null,
  };

  it("requires nombre", () => {
    expect(CreateFormulaSchema.safeParse(base).success).toBe(false);
  });

  it("trims nombre", () => {
    const result = CreateFormulaSchema.parse({ ...base, nombre: "  Mix A  " });
    expect(result.nombre).toBe("Mix A");
  });

  it("rejects blank nombre", () => {
    expect(CreateFormulaSchema.safeParse({ ...base, nombre: "   " }).success).toBe(false);
  });

  it("accepts nombre of exactly 50 chars", () => {
    expect(CreateFormulaSchema.safeParse({ ...base, nombre: "x".repeat(50) }).success).toBe(true);
  });

  it("rejects nombre longer than 50 chars", () => {
    expect(CreateFormulaSchema.safeParse({ ...base, nombre: "x".repeat(51) }).success).toBe(false);
  });
});
```

In `field-labels.spec.ts`, add `"nombre"` as the first entry of the `Formula: [...]` array (line ~55).

- [ ] **Step 2: Run shared tests to verify they fail**

```bash
pnpm --filter @vivero/shared test
```

Expected: FAIL — missing `nombre` (Zod required + label assertions).

- [ ] **Step 3: Implement**

In `formula.schema.ts` add to `FormulaSchema` (after `id`):

```ts
  nombre: z.string(),
```

In `CreateFormulaSchema` add as the first key:

```ts
    nombre: z
      .string({ required_error: "El nombre es requerido" })
      .trim()
      .min(1, "El nombre es requerido")
      .max(50, "Máximo 50 caracteres"),
```

In `field-labels.ts` add `nombre: "Nombre",` as the first key of both the `CreateFormula` (line ~47) and `Formula` (line ~187) sections.

- [ ] **Step 4: Run shared tests to verify they pass**

```bash
pnpm --filter @vivero/shared test && pnpm --filter @vivero/shared build
```

Expected: PASS + build OK (build required before backend/frontend pick up new types).

- [ ] **Step 5: Commit**

```bash
git add packages/shared
git commit -m "feat(shared): require and validate formula nombre"
```

---

### Task 3: Backend formula service 409 + unit fixtures (TDD)

**Files:**
- Modify: `apps/backend/src/modules/formula/formula.service.ts:1-30`
- Modify: `apps/backend/src/modules/formula/__tests__/formula.service.spec.ts`
- Modify: `apps/backend/src/modules/formula/__tests__/formula.repository.spec.ts:25-60` (fixtures only)

**Interfaces:**
- Consumes: `CreateFormulaDto.nombre` (Task 2), Prisma `P2002` on `Formula_nombre_key`.
- Produces: `FormulaService.createFormula` throws `ConflictException('Ya existe una fórmula con ese nombre')` on unique violation; all formula unit fixtures include `nombre`.

- [ ] **Step 1: Update fixtures in both specs**

In `formula.service.spec.ts` add to `mockFormula` (after `id`):

```ts
    nombre: 'Mix A',
```

and to the `createFormula` test payload:

```ts
        nombre: 'Mix A',
```

In `formula.repository.spec.ts` add to `mockRecordWithRelations` (after `id`) and to `expectedDto` (after `id`):

```ts
    nombre: 'Mix A',
```

- [ ] **Step 2: Write the failing service test**

In `formula.service.spec.ts`, add `ConflictException` to the `@nestjs/common` import and `Prisma` to a new import:

```ts
import { Prisma } from '../../../generated/prisma/client';
```

Append inside `describe('createFormula')`:

```ts
    it('maps P2002 unique violation to ConflictException', async () => {
      repo.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed on nombre', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(
        service.createFormula({
          nombre: 'Mix A',
          producto1Id: 'sust-1',
          porcentaje1: 100,
          producto2Id: null,
          porcentaje2: null,
          producto3Id: null,
          porcentaje3: null,
          producto4Id: null,
          porcentaje4: null,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('rethrows non-P2002 errors', async () => {
      repo.create.mockRejectedValue(new Error('boom'));

      await expect(
        service.createFormula({
          nombre: 'Mix A',
          producto1Id: 'sust-1',
          porcentaje1: 100,
          producto2Id: null,
          porcentaje2: null,
          producto3Id: null,
          porcentaje3: null,
          producto4Id: null,
          porcentaje4: null,
        }),
      ).rejects.toThrow('boom');
    });
```

- [ ] **Step 3: Run the formula backend specs to verify they fail**

```bash
pnpm --filter backend exec jest src/modules/formula --runInBand
```

Expected: FAIL — new tests fail (no P2002 mapping), old ones may fail on fixture `nombre` until repository spread includes it (regenerated client).

- [ ] **Step 4: Implement the service mapping**

In `formula.service.ts`:

```ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
```

Replace `createFormula`:

```ts
  async createFormula(data: CreateFormulaDto) {
    try {
      return await this.repo.create(data);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ya existe una fórmula con ese nombre');
      }
      throw error;
    }
  }
```

No repository change needed — `mapRow` spreads the row, so `nombre` flows through automatically.

- [ ] **Step 5: Run the formula backend specs to verify they pass**

```bash
pnpm --filter backend exec jest src/modules/formula --runInBand
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/modules/formula
git commit -m "feat(backend): map formula nombre unique violation to 409"
```

---

### Task 4: `siembraPartidas.formulaNombre` reads the column (TDD)

**Files:**
- Modify: `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts:70-88` (delete builder) and `:187`
- Test: `apps/backend/src/modules/siembraPartidas/__tests__/siembraPartidas.service.spec.ts:40-115`

**Interfaces:**
- Consumes: `Formula.nombre` from the existing `formula` relation include.
- Produces: `SiembraPartidaDto.formulaNombre` === `formula.nombre` (field name unchanged — frontend needs no change for this flow).

- [ ] **Step 1: Update the mock + expectation (failing first)**

In `siembraPartidas.service.spec.ts`, add to the `formula: {...}` object inside the mock row (line ~45):

```ts
      nombre: 'Turf + Perlita',
```

Change `mockDto.formulaNombre` (line ~78) from `'Sin fórmula'` to `'Turf + Perlita'`.

- [ ] **Step 2: Run to verify failure**

```bash
pnpm --filter backend exec jest src/modules/siembraPartidas --runInBand
```

Expected: FAIL — mapper still builds from productos (all null → `'Sin fórmula'`).

- [ ] **Step 3: Implement**

Delete the entire `buildFormulaNombre` private method (lines ~70–88, ending `return parts.length > 0 ? parts.join(' + ') : 'Sin fórmula';`). Replace line ~187:

```ts
      formulaNombre: row.formula.nombre,
```

- [ ] **Step 4: Run to verify pass**

```bash
pnpm --filter backend exec jest src/modules/siembraPartidas --runInBand
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/modules/siembraPartidas
git commit -m "feat(backend): source formulaNombre from formula.nombre"
```

---

### Task 5: Integration tests — nombre roundtrip + 409 (TDD)

**Files:**
- Modify: `apps/backend/test/integration/fixtures/fixtures.ts:151-180`
- Modify: `apps/backend/test/integration/formula.integration.spec.ts:83-140`

**Interfaces:**
- Consumes: `ConflictException` behavior from Task 3 (service mocked in integration app; the 409 test asserts HTTP mapping of a rejected service, duplicate-DP behavior itself is covered by the unit test).

- [ ] **Step 1: Update fixtures (failing first for the 409 test)**

In `fixtures.ts` add to `validCreateFormulaPayload` (first key) and `mockFormulaDto` (after `id`):

```ts
  nombre: 'Mix A',
```

- [ ] **Step 2: Add/adjust tests**

In `formula.integration.spec.ts` add `ConflictException` to the `@nestjs/common` import. In the POST describe:

- In `'returns 201 on valid payload'`, extend the `objectContaining` with:

```ts
          nombre: 'Mix A',
```

- Add:

```ts
    it('returns 409 when nombre already exists', async () => {
      formulaMock.createFormula.mockRejectedValue(
        new ConflictException('Ya existe una fórmula con ese nombre'),
      );

      await request(app.getHttpServer())
        .post('/formula')
        .send(validCreateFormulaPayload())
        .expect(409);
    });

    it('returns 400 when nombre is missing', async () => {
      const { nombre, ...withoutNombre } = validCreateFormulaPayload();

      await request(app.getHttpServer())
        .post('/formula')
        .send(withoutNombre)
        .expect(400);
    });
```

- [ ] **Step 3: Run to verify**

```bash
pnpm --filter backend test:integration
```

Expected: PASS (409/400 tests fail before Step 2 if run with only fixtures updated — that is the red step).

- [ ] **Step 4: Commit**

```bash
git add apps/backend/test/integration
git commit -m "test(backend): cover formula nombre via API integration"
```

---

### Task 6: Frontend create form + 409 feedback (TDD)

**Files:**
- Modify: `apps/frontend/src/features/formulas/components/formula-create-form.tsx:129-141`
- Modify: `apps/frontend/src/features/formulas/components/formula-data-table.tsx:59-70`
- Modify: `apps/frontend/src/features/formulas/hooks/useFormulas.ts:19-30`
- Test: `apps/frontend/src/features/formulas/components/__tests__/formula-create-form.test.tsx`

**Interfaces:**
- Consumes: `CreateFormulaDto.nombre`, `fieldLabels` not used by the form (hardcoded labels per existing pattern).
- Produces: Nombre input in the create slide-over; `defaultValues.nombre: ""`; error toast on mutation failure.

- [ ] **Step 1: Write failing tests**

In `formula-create-form.test.tsx` append (the form already renders through the mocked `FormField`/`Input`):

```tsx
  it("renders the Nombre input", () => {
    render(<FormulaCreateForm {...defaultProps} />);
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    const input = screen.getByPlaceholderText("Nombre de la fórmula");
    expect(input).toHaveAttribute("maxLength", "50");
  });
```

(`defaultProps` = the existing wrapper/harness the file already builds for its other tests — reuse it; if the harness renders the form directly, match its shape.)

- [ ] **Step 2: Run to verify failure**

```bash
pnpm --filter frontend exec jest src/features/formulas/components/__tests__/formula-create-form.test.tsx
```

Expected: FAIL — no Nombre input.

- [ ] **Step 3: Implement**

In `formula-create-form.tsx`, inside the `<form>` before `<div className="space-y-2">` with the `ProductoSlot`s, add:

```tsx
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-foreground">
                Nombre *
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  maxLength={50}
                  placeholder="Nombre de la fórmula"
                  className="h-9 rounded-md px-4 text-sm"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
```

In `formula-data-table.tsx` `defaultValues` add as the first key:

```ts
      nombre: "",
```

In `useFormulas.ts` `useCreateFormula`, add an `onError` callback next to `onSuccess`:

```ts
    onError: (error) => {
      toast.error("No se pudo crear la fórmula", {
        description: error.message,
        duration: 5000,
      });
    },
```

(`clientFetch` throws `ApiError` whose `message` is the backend's `Ya existe una fórmula con ese nombre`.)

- [ ] **Step 4: Run to verify pass**

```bash
pnpm --filter frontend exec jest src/features/formulas/components/__tests__/formula-create-form.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/formulas
git commit -m "feat(frontend): add nombre field to formula create form with conflict toast"
```

---

### Task 7: Selector, table column, view form show the name (TDD)

**Files:**
- Modify: `apps/frontend/src/features/programacionSiembra/components/formulaSelector.tsx:26-34,66`
- Modify: `apps/frontend/src/features/formulas/components/columns.tsx:68-81`
- Modify: `apps/frontend/src/features/formulas/components/formula-view-form.tsx:51-89`
- Test: `apps/frontend/src/features/programacionSiembra/components/__tests__/mezaSelector.test.tsx`
- Test: `apps/frontend/src/features/formulas/components/__tests__/columns.test.tsx`
- Test: `apps/frontend/src/features/formulas/components/__tests__/formula-view-form.test.tsx`
- Test: `apps/frontend/src/features/formulas/__tests__/formulaService.test.ts` (fixture only)

**Interfaces:**
- Consumes: `FormulaDto.nombre` (Task 2).
- Produces: name-only labels everywhere; composition remains only inside the view-form details card.

- [ ] **Step 1: Update tests (red first)**

In `mezaSelector.test.tsx` add `nombre: "Mix A",` to the active formula mock (`m1`) and `nombre: "Coco 100%",` to the inactive one (`m2`). Replace the active-formulas assertion:

```tsx
  it("only renders active fórmulas by nombre", () => {
    render(<FormulaSelector form={mockForm} />);
    expect(screen.getByText("Mix A")).toBeInTheDocument();
    expect(screen.queryByText("Coco 100%")).not.toBeInTheDocument();
  });
```

In `columns.test.tsx` add:

```tsx
  it("puts the nombre column first", () => {
    expect(createFormulaColumns(new Set())[0]).toMatchObject({
      accessorKey: "nombre",
    });
  });
```

In the `formula-view-form` test fixture add `nombre: "Mix A",` to the formula DTO and add:

```tsx
  it("shows the nombre as the title", () => {
    render(<FormulaViewForm selectedFormula={mockFormula} />);
    expect(screen.getByText("Mix A")).toBeInTheDocument();
  });
```

In `formulaService.test.ts` add `nombre: "Mix A",` to the formula DTO fixture(s).

- [ ] **Step 2: Run to verify failure**

```bash
pnpm --filter frontend exec jest src/features/programacionSiembra/components/__tests__/mezaSelector.test.tsx src/features/formulas
```

Expected: FAIL — selector still shows "Turba / Perlita"; no nombre column/title.

- [ ] **Step 3: Implement**

In `formulaSelector.tsx` delete `getCompositionLabel` (lines 26–34) and replace the option body (line 66) with:

```tsx
                  {formula.nombre}
```

In `columns.tsx` add as the first entry of `createFormulaColumns`'s returned array:

```ts
    {
      accessorKey: "nombre",
      header: ({ column }) => (
        <SortableHeader column={column}>Nombre</SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="font-black text-sm text-foreground tracking-tight uppercase truncate">
          {row.original.nombre}
        </span>
      ),
    },
```

In `formula-view-form.tsx` delete the `compositionSummary` const (lines 52–59) and replace the header block text (lines 71–76) with:

```tsx
              <h2 className="text-base font-black tracking-tight leading-none text-foreground uppercase">
                {selectedFormula.nombre}
              </h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                Fórmula
              </p>
```

(Composition rows stay untouched in the details card — that is the spec's "composition remains view-form detail".)

- [ ] **Step 4: Run to verify pass**

```bash
pnpm --filter frontend exec jest src/features/programacionSiembra/components/__tests__/mezaSelector.test.tsx src/features/formulas
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features
git commit -m "feat(frontend): display formula nombre in selector, table and view form"
```

---

### Task 8: Full verification

- [ ] **Step 1: Run the AGENTS.md verification order**

```bash
pnpm lint && pnpm type-check && pnpm test
```

Expected: all green (4 pre-existing lint warnings are unrelated and acceptable).

- [ ] **Step 2: Run backend integration suite**

```bash
pnpm --filter backend test:integration
```

Expected: PASS.

- [ ] **Step 3: Report**

Summarize commits + test totals. Do NOT push unless the user asks.

---

## Self-Review notes

- Spec coverage: schema+migration (T1), shared validation+labels (T2), 409 (T3), formulaNombre (T4), API tests (T5), create form+toast (T6), displays (T7). `ensureGenericFormula` pre-work noted in Global Constraints.
- Type consistency: `nombre` naming identical across Prisma/Zod/DTO/JSX; `CreateFormulaDto.nombre` required everywhere fixtures are built.
- Backfill join format matches actual `buildFormulaNombre` (`' + '`), not the selector's `' / '`.
