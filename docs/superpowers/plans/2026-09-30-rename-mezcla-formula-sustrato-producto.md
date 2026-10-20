# Rename mezcla → formula, sustrato → producto (+ 4 correctness fixes) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the `mezcla` entity to `formula` and the `sustrato` entity to `producto` across the entire stack (code only), then land four correctness fixes (GET /:id arg order, `FormulaRepository` on `BaseRepository`, `POST /formula` returns a mapped DTO, create-schema validation hardening).

**Architecture:** Two-phase, layered execution. Phase 1 (Tasks 1–5) is a pure mechanical rename executed layer by layer (shared → backend → frontend) with verification gates and a boundary audit. Phase 2 (Tasks 6–8) applies behavior changes directly against the final names, TDD-style. Task 9 is final verification + SQL handoff.

**Tech Stack:** Prisma (MariaDB), Zod v3, NestJS 11, Next.js 16, pnpm + Turborepo, Jest

## Global Constraints

- **No git commits** — the user commits manually (no commit steps in this plan).
- **No database migrations** — never run `prisma migrate`. Only `pnpm --filter backend exec prisma generate` (client codegen, no DB write). SQL is handed to the user in Task 9.
- **UI copy stays Spanish; code identifiers are English.**
- **Hard boundaries — never rename:** `LegacySustrato*`, `SustratoSearch`, `l-sustrato`, `useLegacySustratos`, `legacySustratos`, `LegacySustratoDto(Schema)`, `prensadoSustrato`, siembraPartida `sustrato`/`sustratoNombre`/`buildSustratoNombre`/`GENERIC_SUSTRATO_NAME`, the literal `'Sustrato Genérico'`, all of `apps/backend/src/infra/legacy-mysql/`, `apps/backend/src/modules/legacy/sustrato/`, old migration files, `docs/` history, `'sustratos'` inside `permissions.guard.spec.ts` (arbitrary mock value), cuid values `c00000000000000000000001` / `c00000000000000000000002`.
- **Guards unchanged:** `GET /formula` list keeps `@RequirePermission({ tableName: 'programacion_siembra', action: 'create' })`; formula DataTable keeps `tableName="programacion_siembra"`.
- **Slideover `catch {}` pattern untouched** everywhere (global `MutationCache.onError` toast is the error surface).
- **Intermediate failures are expected:** after Task 1 the backend/frontend no longer compile (old import names), and after Tasks 2–3 the frontend still doesn't. Per-layer gates are scoped to the layer being worked on; monorepo-wide gates start at Task 5.
- **zod v3 rule:** field-level errors must carry `path` so RHF `FormMessage` can display them → use `.superRefine` + `ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [...] })`. Keep the existing sum `.refine` as-is.
- Run gates in order: `pnpm lint && pnpm type-check && pnpm test` (turbo), then `pnpm --filter backend test:integration`.

---

## Task 1: Shared package rename (Phase 1, Layer 1)

**Files:**
- Rename: `packages/shared/src/schemas/mezcla.schema.ts` → `formula.schema.ts`
- Rename: `packages/shared/src/schemas/sustratos.schema.ts` → `productos.schema.ts`
- Rename: `packages/shared/src/schemas/__tests__/mezcla.schema.spec.ts` → `formula.schema.spec.ts`
- Rename: `packages/shared/src/schemas/__tests__/sustratos.schema.spec.ts` → `productos.schema.spec.ts`
- Modify: `packages/shared/src/schemas/field-labels.ts`
- Modify: `packages/shared/src/schemas/siembraPartida.schema.ts`
- Modify: `packages/shared/src/schemas/__tests__/siembraPartida.schema.spec.ts`
- Modify: `packages/shared/src/schemas/__tests__/field-labels.spec.ts`
- Modify: `packages/shared/src/schemas/cuid.schema.ts`
- Modify: `packages/shared/src/index.ts`

**Interfaces:**
- Produces (consumed by Tasks 3–4): `FormulaSchema`/`FormulaDto`/`CreateFormulaSchema`/`CreateFormulaDto`, `ProductoSchema`/`ProductoDto`/`CreateProductoSchema`/`CreateProductoDto`/`UpdateProductoSchema`/`UpdateProductoDto`, `fieldLabels.Formula`/`fieldLabels.CreateFormula`/`fieldLabels.Producto`/`fieldLabels.CreateProducto`, `SiembraPartidaDto.formulaId`/`formulaNombre`, `CreateSiembraPartidaDto.formulaId`.

**Validation-message note:** Phase 1 renames identifiers and any *mezcla* wording only. Messages that say "sustrato" inside `formula.schema.ts`/`productos.schema.ts` (`"El sustrato 1 es requerido"`, `"El nombre del sustrato es requerido"`) are intentionally kept until Task 8 — they are on the Phase-1 audit allowlist (see Task 5). Same for spec assertions that check those message substrings.

- [ ] **Step 1: Rename schema files**

```bash
git mv packages/shared/src/schemas/mezcla.schema.ts packages/shared/src/schemas/formula.schema.ts
git mv packages/shared/src/schemas/sustratos.schema.ts packages/shared/src/schemas/productos.schema.ts
git mv packages/shared/src/schemas/__tests__/mezcla.schema.spec.ts packages/shared/src/schemas/__tests__/formula.schema.spec.ts
git mv packages/shared/src/schemas/__tests__/sustratos.schema.spec.ts packages/shared/src/schemas/__tests__/productos.schema.spec.ts
```

- [ ] **Step 2: Write `formula.schema.ts` (complete file)**

`packages/shared/src/schemas/formula.schema.ts` — replaces the old mezcla schema. Identifiers renamed; "sustrato" messages kept (Task 8 changes them); the `id` label word "mezcla" must become "fórmula" (audit rule: zero `mezcla` hits in code):

```typescript
// shared/src/schemas/formula.schema.ts

import { z } from "zod";
import { requiredCuid } from "./cuid.schema";

export const FormulaSchema = z.object({
  id: requiredCuid("La fórmula"),
  producto1Id: requiredCuid("El sustrato 1"),
  producto1Nombre: z.string(),
  porcentaje1: z.number(),
  producto2Id: requiredCuid("El sustrato 2").nullable(),
  producto2Nombre: z.string().nullable(),
  porcentaje2: z.number().nullable(),
  producto3Id: requiredCuid("El sustrato 3").nullable(),
  producto3Nombre: z.string().nullable(),
  porcentaje3: z.number().nullable(),
  producto4Id: requiredCuid("El sustrato 4").nullable(),
  producto4Nombre: z.string().nullable(),
  porcentaje4: z.number().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export type FormulaDto = z.infer<typeof FormulaSchema>;

export const CreateFormulaSchema = z
  .object({
    producto1Id: requiredCuid("El sustrato 1"),
    porcentaje1: z.number({ required_error: "El porcentaje 1 es requerido" }),
    producto2Id: requiredCuid("El sustrato 2").nullable(),
    porcentaje2: z.number().nullable(),
    producto3Id: requiredCuid("El sustrato 3").nullable(),
    porcentaje3: z.number().nullable(),
    producto4Id: requiredCuid("El sustrato 4").nullable(),
    porcentaje4: z.number().nullable(),
  })
  .refine(
    (data) => {
      const total =
        data.porcentaje1 +
        (data.porcentaje2 ?? 0) +
        (data.porcentaje3 ?? 0) +
        (data.porcentaje4 ?? 0);
      return total === 100;
    },
    { message: "Los porcentajes deben sumar 100%" },
  );

export type CreateFormulaDto = z.infer<typeof CreateFormulaSchema>;
```

- [ ] **Step 3: Write `productos.schema.ts` (complete file)**

`packages/shared/src/schemas/productos.schema.ts` — messages kept until Task 8:

```typescript
// shared/src/schemas/productos.schema.ts

import { z } from "zod";
import { requiredCuid } from "./cuid.schema";

export const ProductoSchema = z.object({
  id: requiredCuid("El sustrato"),
  nombre: z.string(),
  createdAt: z.date(),
});

export type ProductoDto = z.infer<typeof ProductoSchema>;

export const CreateProductoSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre del sustrato es requerido" }),
});

export type CreateProductoDto = z.infer<typeof CreateProductoSchema>;

export const UpdateProductoSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre del sustrato es requerido" }).optional(),
});

export type UpdateProductoDto = z.infer<typeof UpdateProductoSchema>;
```

- [ ] **Step 4: Update `field-labels.ts`**

`packages/shared/src/schemas/field-labels.ts` — exact replacements (before → after), nothing else changes:

| Where | Before | After |
|---|---|---|
| line 36 comment | `// ── Sustratos ──` | `// ── Productos ──` |
| line 37 | `CreateSustrato: {` | `CreateProducto: {` |
| line 41 comment | `// ── Mezclas ──` | `// ── Fórmulas ──` |
| line 42 | `CreateMezcla: {` | `CreateFormula: {` |
| lines 43–50 | `sustrato1Id: "Sustrato 1",` … `sustrato4Id: "Sustrato 4",` (4 pairs; porcentaje lines stay) | `producto1Id: "Producto 1",` … `producto4Id: "Producto 4",` |
| line 82 | `mezclaId: "Mezcla",` | `formulaId: "Fórmula",` |
| line 104 | `mezclaId: "Mezcla",` | `formulaId: "Fórmula",` |
| line 127 | `mezclaNombre: "Mezcla",` | `formulaNombre: "Fórmula",` |
| line 181 comment | `// ── Mezclas (data table columns) ──` | `// ── Fórmulas (data table columns) ──` |
| line 182 | `Mezcla: {` | `Formula: {` |
| lines 183–190 | `sustrato1Nombre: "Sustrato 1",` … `sustrato4Nombre: "Sustrato 4",` | `producto1Nombre: "Producto 1",` … `producto4Nombre: "Producto 4",` |
| line 224 | `mezclaId: "Mezcla",` | `formulaId: "Fórmula",` |
| line 225 | `mezclaNombre: "Mezcla",` | `formulaNombre: "Fórmula",` |
| line 250 comment | `// ── Sustratos (data table columns) ──` | `// ── Productos (data table columns) ──` |
| line 251 | `Sustrato: {` | `Producto: {` |

**DO NOT TOUCH:** lines 79/100/123/220 `prensadoSustrato: "Prensado"`, line 103 `sustrato: "Sustrato"`, lines 67–76 `AsignarUbiSiembra`, lines 194–208 `SiembraLegacy`.

- [ ] **Step 5: Update `siembraPartida.schema.ts`**

`packages/shared/src/schemas/siembraPartida.schema.ts` — three edits only:

```typescript
// line 38 (SiembraPartidaSchema)
formulaId: requiredCuid("La fórmula"),

// line 40 (SiembraPartidaSchema)
formulaNombre: z.string(),

// line 102 (CreateSiembraPartidaSchema)
formulaId: cuidSchema.optional(),
```

**DO NOT TOUCH:** lines 25–31/85–91 `prensadoSustrato`, lines 36–37 `sustrato`/`sustratoNombre`, line 101 `sustrato: z.string(...)` in `CreateSiembraPartidaSchema`, `PrensadoSustratoValues`.

- [ ] **Step 6: Update `siembraPartida.schema.spec.ts`**

`packages/shared/src/schemas/__tests__/siembraPartida.schema.spec.ts` — replacements:

- `mezclaId` → `formulaId` (all occurrences: test data lines 20, 81, 82, 89, 141, 151, 164, 216, 221, 230 and titles `rejects missing mezclaId`, `accepts creation without mezclaId`, `rejects invalid mezclaId with Spanish message`)
- `mezclaNombre` → `formulaNombre` (line 22 etc.)
- `withoutMezcla` → `withoutFormula` (line 82)
- assertion line 94: `expect(messages.some((m) => m.includes("La mezcla")))` → `.includes("La fórmula")`

**DO NOT TOUCH:** `sustrato: "sustrato1"` (lines 142, 160, 182, 199), `prensadoSustrato`, the value `"Sustrato A (100%)"`.

- [ ] **Step 7: Update `field-labels.spec.ts`**

`packages/shared/src/schemas/__tests__/field-labels.spec.ts` — replacements in `DATA_TABLE_COLUMNS`:

- SiembraPartida array: `"mezclaNombre"` → `"formulaNombre"` (line 27)
- `Mezcla: [` → `Formula: [` (line 55) and its entries `"sustrato1Nombre"`…`"sustrato4Nombre"` → `"producto1Nombre"`…`"producto4Nombre"`
- `Sustrato: ["nombre", "createdAt"]` → `Producto: ["nombre", "createdAt"]` (line 94)
- ASembrar array: `"mezclaId"` → `"formulaId"`, `"mezclaNombre"` → `"formulaNombre"` (lines 108–109)

**DO NOT TOUCH:** `"prensadoSustrato"` entries (lines 23, 104).

- [ ] **Step 8: Update `formula.schema.spec.ts`**

`packages/shared/src/schemas/__tests__/formula.schema.spec.ts` — replacements:

- Header comment path → `formula.schema.spec.ts`; import → `from "../formula.schema"`
- Symbols: `MezclaSchema` → `FormulaSchema`, `CreateMezclaSchema` → `CreateFormulaSchema`
- Keys: `sustrato1Id`→`producto1Id`, `sustrato2Id`→`producto2Id`, `sustrato3Id`→`producto3Id`, `sustrato4Id`→`producto4Id`, `sustrato1Nombre`→`producto1Nombre` (+2/3/4), `withoutSustrato1`→`withoutProducto1`
- Assertions: `expect(result.sustrato1Id)` → `expect(result.producto1Id)`
- Titles containing "mezcla" → "fórmula" (e.g. `accepts valid mezcla with all fields` → `accepts valid fórmula with all fields`, `accepts mezcla with only required sustrato` → `accepts fórmula with only required producto`); titles with `sustrato1Id` → `producto1Id` (`rejects missing producto1Id`, `rejects invalid producto1Id with Spanish message`)
- **KEEP until Task 8:** `expect(messages.some((m) => m.includes("sustrato 1")))` (2 occurrences) — Task 8 flips them to `"producto 1"`

- [ ] **Step 9: Update `productos.schema.spec.ts`**

`packages/shared/src/schemas/__tests__/productos.schema.spec.ts` — replacements:

- Header comment path; import → `from "../productos.schema"`
- Symbols: `SustratoSchema`→`ProductoSchema`, `CreateSustratoSchema`→`CreateProductoSchema`, `UpdateSustratoSchema`→`UpdateProductoSchema`
- Titles: `accepts valid sustrato` → `accepts valid producto`
- **KEEP until Task 8:** `expect(messages.some((m) => m.includes("sustrato")))` and both `expect(messages).toContain("El nombre del sustrato es requerido")` — Task 8 flips them to the producto wording.

- [ ] **Step 10: Update `cuid.schema.ts` and `index.ts`**

`packages/shared/src/schemas/cuid.schema.ts` line 22 JSDoc:

```typescript
 * @example formulaId: requiredCuid("La fórmula")
```

(was `mezclaId: requiredCuid("La mezcla")`).

`packages/shared/src/index.ts` lines 25–26:

```typescript
export * from "./schemas/productos.schema";
export * from "./schemas/formula.schema";
```

- [ ] **Step 11: Gate — build and test shared**

```bash
pnpm --filter @vivero/shared build && pnpm --filter @vivero/shared test
```

Expected: build succeeds; all jest suites PASS (including the renamed `formula.schema.spec.ts`, `productos.schema.spec.ts`, `field-labels.spec.ts`, `siembraPartida.schema.spec.ts`).

- [ ] **Step 12: Verify zero mezcla hits in shared**

```bash
rg -i 'mezcla' packages/shared/src
```

Expected: no matches. (`rg -i 'sustrato' packages/shared/src` still matches only: `formula.schema.ts` messages, `productos.schema.ts` messages, their spec assertions, `siembraPartida*`, `programacionSiembra.schema.ts` LegacySustrato, `field-labels.ts` line 103 — all allowlisted until Tasks 5/8.)

## Task 2: Prisma schema rename

**Files:**
- Rename: `apps/backend/prisma/schema/mezcla.prisma` → `formula.prisma`
- Rename: `apps/backend/prisma/schema/sustratos.prisma` → `productos.prisma`
- Modify: `apps/backend/prisma/schema/siembraPartidas.prisma`
- Modify: `apps/backend/prisma/schema/user.prisma`

**Interfaces:**
- Produces (consumed by Tasks 3, 7): Prisma models `Formula`, `Producto`; delegates `prisma.formula`, `prisma.producto`; relation fields `SiembraPartidas.formulaId` / `SiembraPartidas.formula`; back-relations `Formula.siembraPartidas`, `User.deletedFormula`, `User.deletedProducto`.

**Note:** do NOT run `prisma migrate`. After this task the backend will not type-check until Task 3 completes — expected.

- [ ] **Step 1: Rename schema files**

```bash
git mv apps/backend/prisma/schema/mezcla.prisma apps/backend/prisma/schema/formula.prisma
git mv apps/backend/prisma/schema/sustratos.prisma apps/backend/prisma/schema/productos.prisma
```

- [ ] **Step 2: Write `formula.prisma` (complete file)**

```prisma
model Formula {
    id          String @id @default(cuid())
    producto1Id String
    porcentaje1  Int
    producto1   Producto @relation("producto1", fields: [producto1Id], references: [id])

    producto2Id String?
    porcentaje2  Int?
    producto2   Producto? @relation("producto2", fields: [producto2Id], references: [id])

    producto3Id String?
    porcentaje3  Int?
    producto3   Producto? @relation("producto3", fields: [producto3Id], references: [id])

    producto4Id String?
    porcentaje4  Int?
    producto4   Producto? @relation("producto4", fields: [producto4Id], references: [id])

    siembraPartidas SiembraPartidas[]


  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  deletedByUserId String?
    deletedByUser User? @relation("deleted_formulas", fields: [deletedByUserId], references: [id], onDelete: NoAction, onUpdate: NoAction)

  deletedAt DateTime? @db.Timestamp(0)
}
```

- [ ] **Step 3: Write `productos.prisma` (complete file)**

```prisma
model Producto {
    id          String @id @default(cuid())
    nombre      String @unique


  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  formulaProducto1 Formula[] @relation("producto1")
  formulaProducto2 Formula[] @relation("producto2")
  formulaProducto3 Formula[] @relation("producto3")
  formulaProducto4 Formula[] @relation("producto4")


  deletedByUserId String?
    deletedByUser User? @relation("deleted_productos", fields: [deletedByUserId], references: [id], onDelete: NoAction, onUpdate: NoAction)

  deletedAt DateTime? @db.Timestamp(0)
}
```

- [ ] **Step 4: Edit `siembraPartidas.prisma`**

Lines 21–22:

```prisma
  formulaId String
    formula Formula @relation(fields: [formulaId], references: [id])
```

(was `mezclaId` / `mezcla Mezcla …`). **DO NOT TOUCH** line 11 `sustrato String?  // substrate code from articulo table` nor `prensadoSustrato`.

- [ ] **Step 5: Edit `user.prisma`**

Lines 39–40:

```prisma
    deletedFormula Formula[] @relation("deleted_formulas")
    deletedProducto Producto[] @relation("deleted_productos")
```

- [ ] **Step 6: Generate Prisma client**

```bash
pnpm --filter backend exec prisma generate
```

Expected: `Generated Prisma Client` (or equivalent success). Never run `prisma migrate` / `db push`.

---

## Task 3: Backend rename (Phase 1, Layer 2)

**Files:**
- Rename dir: `apps/backend/src/modules/mezcla` → `modules/formula` (and 7 files inside)
- Rename dir: `apps/backend/src/modules/sustratos` → `modules/productos` (and 7 files inside)
- Modify: `apps/backend/src/app.module.ts`
- Modify: `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts`
- Modify: `apps/backend/src/modules/siembraPartidas/repositories/siembraPartidas.repository.ts`
- Modify: `apps/backend/src/modules/siembraPartidas/__tests__/siembraPartidas.{service,controller,repository}.spec.ts`
- Modify: `apps/backend/src/modules/legacy/partidas/partidas.service.ts`
- Rename/Modify: `apps/backend/test/integration/mezcla.integration.spec.ts` → `formula.integration.spec.ts`, `sustratos.integration.spec.ts` → `productos.integration.spec.ts`
- Modify: `apps/backend/test/integration/{fixtures/fixtures.ts, helpers/mock-factories.ts, helpers/create-app.ts, programacionSiembra.integration.spec.ts}`

**Interfaces:**
- Consumes: Task 1 exports (`FormulaDto`, `CreateFormulaSchema`, `ProductoDto`, …) and Task 2 Prisma delegates (`prisma.formula`, `prisma.producto`, `SiembraPartidas.formulaId`).
- Produces (consumed by Tasks 4, 6, 7): classes `FormulaController/FormulaService/FormulaRepository/FormulaModule`, `ProductosController/ProductosService/ProductosRepository/ProductosModule`; routes `GET|POST /formula`, `GET /formula/:id`, `GET|POST /formula/:id|PATCH /productos…`; service methods `getAllFormula(requesterId)`, `getFormulaById(id, requesterId)`, `createFormula(data)`, `getAllProductos(requesterId)`, `getProductoById(requesterId, id)`, `createProducto(data)`, `updateProducto(requesterId, id, data)`; `SiembraPartidasWithRelations.formula` (with `producto1..4`); mock factories `createFormulaMock()` (`getAllFormula`/`getFormulaById`/`createFormula`), `createProductosMock()` (`getAllProductos`/`getProductoById`/`createProducto`/`updateProducto`); `ServiceOverrides` keys `formula` and `productos`.

- [ ] **Step 1: Rename module dirs and files**

```bash
git mv apps/backend/src/modules/mezcla apps/backend/src/modules/formula
git mv apps/backend/src/modules/formula/mezcla.controller.ts apps/backend/src/modules/formula/formula.controller.ts
git mv apps/backend/src/modules/formula/mezcla.service.ts apps/backend/src/modules/formula/formula.service.ts
git mv apps/backend/src/modules/formula/mezcla.module.ts apps/backend/src/modules/formula/formula.module.ts
git mv apps/backend/src/modules/formula/repositories/mezcla.repository.ts apps/backend/src/modules/formula/repositories/formula.repository.ts
git mv apps/backend/src/modules/formula/__tests__/mezcla.controller.spec.ts apps/backend/src/modules/formula/__tests__/formula.controller.spec.ts
git mv apps/backend/src/modules/formula/__tests__/mezcla.service.spec.ts apps/backend/src/modules/formula/__tests__/formula.service.spec.ts
git mv apps/backend/src/modules/formula/__tests__/mezcla.repository.spec.ts apps/backend/src/modules/formula/__tests__/formula.repository.spec.ts

git mv apps/backend/src/modules/sustratos apps/backend/src/modules/productos
git mv apps/backend/src/modules/productos/sustratos.controller.ts apps/backend/src/modules/productos/productos.controller.ts
git mv apps/backend/src/modules/productos/sustratos.service.ts apps/backend/src/modules/productos/productos.service.ts
git mv apps/backend/src/modules/productos/sustratos.module.ts apps/backend/src/modules/productos/productos.module.ts
git mv apps/backend/src/modules/productos/repositories/sustratos.repository.ts apps/backend/src/modules/productos/repositories/productos.repository.ts
git mv apps/backend/src/modules/productos/__tests__/sustratos.controller.spec.ts apps/backend/src/modules/productos/__tests__/productos.controller.spec.ts
git mv apps/backend/src/modules/productos/__tests__/sustratos.service.spec.ts apps/backend/src/modules/productos/__tests__/productos.service.spec.ts
git mv apps/backend/src/modules/productos/__tests__/sustratos.repository.spec.ts apps/backend/src/modules/productos/__tests__/productos.repository.spec.ts
```

- [ ] **Step 2: Write `formula.controller.ts` (complete file)**

Note the intentionally-buggy last line — Task 6 fixes it (spec risk: fix the test+code together there).

```typescript
// src/modules/formula/formula.controller.ts

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import { FormulaService } from './formula.service';
import { CreateFormulaDto, CreateFormulaSchema, FormulaDto } from '@vivero/shared';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation-pipe';

@Controller('formula')
export class FormulaController {
  constructor(private readonly service: FormulaService) {}

  @Get()
  @RequirePermission({
    tableName: 'programacion_siembra',
    action: 'create',
    scope: 'ALL',
  })
  async getAllFormula(@CurrentUser() user: AuthUser): Promise<FormulaDto[]> {
    return this.service.getAllFormula(user.id);
  }

  @Post()
  @RequirePermission({ tableName: 'formulas', action: 'create', scope: 'ALL' })
  async createFormula(
    @Body(new ZodValidationPipe(CreateFormulaSchema))
    data: CreateFormulaDto,
  ) {
    return this.service.createFormula(data);
  }

  @Get(':id')
  @RequirePermission({ tableName: 'formulas', action: 'read', scope: 'ALL' })
  async getFormula(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<FormulaDto> {
    return this.service.getFormulaById(user.id, id);
  }
}
```

- [ ] **Step 3: Write `formula.service.ts` (complete file)**

```typescript
// src/modules/formula/formula.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { FormulaRepository } from './repositories/formula.repository';
import { CreateFormulaDto, FormulaDto } from '@vivero/shared';

@Injectable()
export class FormulaService {
  constructor(private readonly repo: FormulaRepository) {}

  async getAllFormula(requesterId: string): Promise<FormulaDto[]> {
    return this.repo.findAll(requesterId);
  }

  async getFormulaById(id: string, requesterId: string): Promise<FormulaDto> {
    const formula = await this.repo.findById(id, requesterId);
    if (!formula) throw new NotFoundException('Formula not found');
    return formula;
  }

  async createFormula(data: CreateFormulaDto) {
    return this.repo.create(data);
  }
}
```

- [ ] **Step 4: Write `formula.module.ts` (complete file)**

```typescript
// src/modules/formula/formula.module.ts

import { Module } from '@nestjs/common';
import { FormulaController } from './formula.controller';
import { FormulaService } from './formula.service';
import { FormulaRepository } from './repositories/formula.repository';

@Module({
  controllers: [FormulaController],
  providers: [FormulaService, FormulaRepository],
  exports: [FormulaService],
})
export class FormulaModule {}
```

- [ ] **Step 5: Write `formula.repository.ts` (complete file — Phase 1 logic)**

Mechanical port of the old repository (raw `create` stays; Task 7 overhauls it):

```typescript
// src/modules/formula/repositories/formula.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { CreateFormulaDto, FormulaDto } from '@vivero/shared';

@Injectable()
export class FormulaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(_requesterId: string): Promise<FormulaDto[]> {
    const rows = await this.prisma.formula.findMany({
      where: { deletedAt: null },
      include: {
        producto1: { select: { nombre: true } },
        producto2: { select: { nombre: true } },
        producto3: { select: { nombre: true } },
        producto4: { select: { nombre: true } },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      producto1Id: r.producto1Id,
      producto1Nombre: r.producto1.nombre,
      porcentaje1: r.porcentaje1,
      producto2Id: r.producto2Id,
      producto2Nombre: r.producto2?.nombre ?? null,
      porcentaje2: r.porcentaje2,
      producto3Id: r.producto3Id,
      producto3Nombre: r.producto3?.nombre ?? null,
      porcentaje3: r.porcentaje3,
      producto4Id: r.producto4Id,
      producto4Nombre: r.producto4?.nombre ?? null,
      porcentaje4: r.porcentaje4,
      isActive: r.isActive,
      createdAt: r.createdAt,
    }));
  }

  async findById(id: string, _requesterId: string): Promise<FormulaDto | null> {
    const row = await this.prisma.formula.findUnique({
      where: { id },
      include: {
        producto1: { select: { nombre: true } },
        producto2: { select: { nombre: true } },
        producto3: { select: { nombre: true } },
        producto4: { select: { nombre: true } },
      },
    });

    if (!row || row.deletedAt) return null;

    return {
      id: row.id,
      producto1Id: row.producto1Id,
      producto1Nombre: row.producto1.nombre,
      porcentaje1: row.porcentaje1,
      producto2Id: row.producto2Id,
      producto2Nombre: row.producto2?.nombre ?? null,
      porcentaje2: row.porcentaje2,
      producto3Id: row.producto3Id,
      producto3Nombre: row.producto3?.nombre ?? null,
      porcentaje3: row.porcentaje3,
      producto4Id: row.producto4Id,
      producto4Nombre: row.producto4?.nombre ?? null,
      porcentaje4: row.porcentaje4,
      isActive: row.isActive,
      createdAt: row.createdAt,
    };
  }

  async create(data: CreateFormulaDto) {
    return this.prisma.formula.create({ data });
  }
}
```

- [ ] **Step 6: Write the `productos` module (complete files)**

`apps/backend/src/modules/productos/productos.controller.ts`:

```typescript
// src/modules/productos/productos.controller.ts

import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorators';
import { AuthUser } from '../auth/types/auth-user.type';
import { ProductosService } from './productos.service';
import {
  CreateProductoDto,
  CreateProductoSchema,
  ProductoDto,
  UpdateProductoDto,
  UpdateProductoSchema,
} from '@vivero/shared';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation-pipe';

@Controller('productos')
export class ProductosController {
  constructor(private readonly service: ProductosService) {}

  @Get()
  @RequirePermission({ tableName: 'productos', action: 'read', scope: 'ALL' })
  async getAllProductos(@CurrentUser() user: AuthUser): Promise<ProductoDto[]> {
    return this.service.getAllProductos(user.id);
  }

  @Post()
  @RequirePermission({ tableName: 'productos', action: 'create', scope: 'ALL' })
  async createProducto(
    @Body(new ZodValidationPipe(CreateProductoSchema))
    data: CreateProductoDto,
  ) {
    return this.service.createProducto(data);
  }

  @Get(':id')
  @RequirePermission({ tableName: 'productos', action: 'read', scope: 'ALL' })
  async getProducto(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<ProductoDto | null> {
    return this.service.getProductoById(user.id, id);
  }

  @Patch(':id')
  @RequirePermission({ tableName: 'productos', action: 'update', scope: 'ALL' })
  async updateProducto(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateProductoSchema))
    data: UpdateProductoDto,
  ) {
    return this.service.updateProducto(user.id, id, data);
  }
}
```

`apps/backend/src/modules/productos/productos.service.ts`:

```typescript
// src/modules/productos/productos.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';

import { ProductosRepository } from './repositories/productos.repository';
import {
  CreateProductoDto,
  ProductoDto,
  UpdateProductoDto,
} from '@vivero/shared';

@Injectable()
export class ProductosService {
  constructor(private readonly repo: ProductosRepository) {}

  async getAllProductos(requesterId: string): Promise<ProductoDto[]> {
    const rows = await this.repo.findAll(requesterId);
    return rows.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      createdAt: r.createdAt,
    }));
  }

  async getProductoById(
    requesterId: string,
    id: string,
  ): Promise<ProductoDto | null> {
    const row = await this.repo.findById(id, requesterId);
    if (!row) return null;
    return {
      id: row.id,
      nombre: row.nombre,
      createdAt: row.createdAt,
    };
  }

  async createProducto(data: CreateProductoDto) {
    return await this.repo.create({
      nombre: data.nombre,
    });
  }

  async updateProducto(
    requesterId: string,
    id: string,
    data: UpdateProductoDto,
  ) {
    if (!data.nombre) {
      throw new BadRequestException('nombre is required');
    }

    return await this.repo.update(id, {
      nombre: data.nombre,
    });
  }
}
```

`apps/backend/src/modules/productos/productos.module.ts`:

```typescript
// src/modules/productos/productos.module.ts

import { Module } from '@nestjs/common';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { ProductosRepository } from './repositories/productos.repository';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService, ProductosRepository],
  exports: [ProductosService],
})
export class ProductosModule {}
```

`apps/backend/src/modules/productos/repositories/productos.repository.ts`:

```typescript
// src/modules/productos/repositories/productos.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { BaseRepository } from '../../../shared/baseModule/base.repository';
import { Producto } from '../../../generated/prisma/client';

@Injectable()
export class ProductosRepository extends BaseRepository<Producto> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.producto);
  }

  async update(
    id: string,
    data: {
      nombre: string;
    },
  ) {
    return this.model.update({
      where: { id, deletedAt: null, isActive: true },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }
}
```

- [ ] **Step 7: Update `app.module.ts`**

Lines 41–42 imports:

```typescript
import { FormulaModule } from './modules/formula/formula.module';
import { ProductosModule } from './modules/productos/productos.module';
```

Lines 114–115 providers array:

```typescript
    FormulaModule,
    ProductosModule,
```

- [ ] **Step 8: Update `siembraPartidas.repository.ts`**

`apps/backend/src/modules/siembraPartidas/repositories/siembraPartidas.repository.ts` — rename in the hand-written type (lines 7–14) and in all 3 `include` blocks (lines 47, 67, 107):

- `mezcla: {` → `formula: {`
- `sustrato1: { nombre: string } | null;` → `producto1: { nombre: string } | null;` (same for 2, 3, 4)
- `sustrato1: { select: { nombre: true } },` → `producto1: { select: { nombre: true } },` (2, 3, 4 — inside each of the 3 include blocks; `user: { select: { username: true } }` untouched)

The resulting type head:

```typescript
export type SiembraPartidasWithRelations = SiembraPartidas & {
  formula: {
    producto1: { nombre: string } | null;
    porcentaje1: number | null;
    producto2: { nombre: string } | null;
    porcentaje2: number | null;
    producto3: { nombre: string } | null;
    porcentaje3: number | null;
    producto4: { nombre: string } | null;
    porcentaje4: number | null;
  } | null;
  user: { username: string };
};
```

(keep the exact original shape/order of fields — only `mezcla`→`formula`, `sustratoN`→`productoN`).

- [ ] **Step 9: Update `siembraPartidas.service.ts` (dangerous file — exact edits)**

`apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts`. Apply exactly these edits:

1. Line 26: `const GENERIC_MEZCLA_SUSTRATO1_ID = 'c00000000000000000000001';` → `const GENERIC_PRODUCTO1_ID = 'c00000000000000000000001';` (**value unchanged**)
2. Replace the whole `getOrCreateGenericMezcla` method (lines 40–61) with:

```typescript
  private async getOrCreateGenericFormula(): Promise<string> {
    const producto = await this.prisma.producto.upsert({
      where: { nombre: GENERIC_SUSTRATO_NAME },
      update: {},
      create: {
        id: GENERIC_PRODUCTO1_ID,
        nombre: GENERIC_SUSTRATO_NAME,
      },
    });

    const formula = await this.prisma.formula.upsert({
      where: { id: 'c00000000000000000000002' },
      update: {},
      create: {
        id: 'c00000000000000000000002',
        producto1Id: producto.id,
        porcentaje1: 100,
      },
    });

    return formula.id;
  }
```

**The literals `'Sustrato Genérico'` (via `GENERIC_SUSTRATO_NAME`) and both cuid values must be byte-identical to before** (upsert-by-nombre + fixed id; changing them creates a duplicate-id crash).

3. Replace `buildMezclaNombre` (lines 63–79) with:

```typescript
  private buildFormulaNombre(
    formula: SiembraPartidasWithRelations['formula'],
  ): string {
    const parts: string[] = [];
    if (formula.producto1 && formula.porcentaje1 != null) {
      parts.push(`${formula.producto1.nombre} (${formula.porcentaje1}%)`);
    }
    if (formula.producto2 && formula.porcentaje2 != null) {
      parts.push(`${formula.producto2.nombre} (${formula.porcentaje2}%)`);
    }
    if (formula.producto3 && formula.porcentaje3 != null) {
      parts.push(`${formula.producto3.nombre} (${formula.porcentaje3}%)`);
    }
    if (formula.producto4 && formula.porcentaje4 != null) {
      parts.push(`${formula.producto4.nombre} (${formula.porcentaje4}%)`);
    }
    return parts.length > 0 ? parts.join(' + ') : 'Sin fórmula';
  }
```

4. Line 178: `mezclaId: row.mezclaId,` → `formulaId: row.formulaId,`
5. Line 180: `mezclaNombre: this.buildMezclaNombre(row.mezcla),` → `formulaNombre: this.buildFormulaNombre(row.formula),`
6. Line 272: `const mezclaId = data.mezclaId ?? (await this.getOrCreateGenericMezcla());` → `const formulaId = data.formulaId ?? (await this.getOrCreateGenericFormula());`
7. Lines 289–293 (inside `repo.createSiembraPartida`):

```typescript
      formula: {
        connect: {
          id: formulaId,
        },
      },
```

8. Line 350: `const mezclaId = await this.getOrCreateGenericMezcla();` → `const formulaId = await this.getOrCreateGenericFormula();`
9. Line 360: `mezcla: { connect: { id: mezclaId } },` → `formula: { connect: { id: formulaId } },`
10. Line 469: `...(data.mezclaId ? { mezcla: { connect: { id: data.mezclaId } } } : {}),` → `...(data.formulaId ? { formula: { connect: { id: data.formulaId } } } : {}),`

**DO NOT TOUCH in this file:** line 23 `LegacySustratoService` import, line 25 `GENERIC_SUSTRATO_NAME`, line 37 `sustratoService` field, `buildSustratoNombre` (lines 93–99), lines 142–144 `sustratoNombre`/`row.sustrato`, line 173/279/357/465 `prensadoSustrato`, lines 176/282/468 `sustrato: …`.

Verification after this step:

```bash
rg -n 'mezcla' apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts
```

Expected: no matches.

- [ ] **Step 10: Update `partidas.service.ts`**

`apps/backend/src/modules/legacy/partidas/partidas.service.ts` line 100:

```typescript
      formulaId: data.formulaId,
```

(was `mezclaId: data.mezclaId` — `data` is `AsignarUbiSiembraCompletaDto`, which carries the field via `CreateSiembraPartidaSchema`). Line 97 `sustrato: data.sustrato,` stays.

- [ ] **Step 11: Update the 3 siembraPartidas specs**

`__tests__/siembraPartidas.service.spec.ts` replacements:

- `sustratos: { upsert: jest.Mock }` → `producto: { upsert: jest.Mock }` (type, line ~22) and `sustratos: { upsert: jest.fn() }` → `producto: { upsert: jest.fn() }` (line ~114)
- `mezcla: { upsert: jest.Mock }` → `formula: { upsert: jest.Mock }` and `mezcla: { upsert: jest.fn() }` → `formula: { upsert: jest.fn() }`
- mockRow: `mezclaId: 'mezcla-1',` → `formulaId: 'formula-1',`; the `mezcla: { sustrato1: null, … }` block → `formula: { producto1: null, porcentaje1: null, producto2: null, porcentaje2: null, producto3: null, porcentaje3: null, producto4: null, porcentaje4: null },`
- mockDto: `mezclaId: 'mezcla-1',` → `formulaId: 'formula-1',`; `mezclaNombre: 'Sin mezcla',` → `formulaNombre: 'Sin fórmula',`
- `data` objects: `mezclaId: 'mezcla-1',` → `formulaId: 'formula-1',` (2 occurrences)
- expected create payloads: `mezcla: { connect: { id: 'mezcla-1' } },` → `formula: { connect: { id: 'formula-1' } },` (2 occurrences)
- autorizar test: `prismaMock.sustratos.upsert.mockResolvedValue({ id: 'sustrato-1' });` → `prismaMock.producto.upsert.mockResolvedValue({ id: 'producto-1' });`; `prismaMock.mezcla.upsert.mockResolvedValue({ id: 'mezcla-1' });` → `prismaMock.formula.upsert.mockResolvedValue({ id: 'formula-1' });`

**DO NOT TOUCH:** `LegacySustratoService` import, `sustratoServiceMock`, `sustrato: 'Sustrato A'` (siembraPartida field fixtures), `prensadoSustrato`.

`__tests__/siembraPartidas.controller.spec.ts`: mockDto `mezclaId: 'mezcla-1',` → `formulaId: 'formula-1',` (line 25).

`__tests__/siembraPartidas.repository.spec.ts`: `mezclaId: 'mezcla-1',` → `formulaId: 'formula-1',` (5 occurrences: lines 26, 137, 154, 183, 194).

- [ ] **Step 12: Rename + update formula module specs**

Replacements for all three files (header comments, imports `../formula.controller`/`../formula.service`/`../repositories/formula.repository`, class names `FormulaController`/`FormulaService`/`FormulaRepository`, describe titles):

`__tests__/formula.controller.spec.ts`:
- service mock type/keys: `getAllFormula`, `getFormulaById`, `createFormula` (3 keys in type + 3 in beforeEach)
- mockDto: `id: 'mezcla-1'` → `id: 'formula-1'`; keys `sustrato1Id: 'sust-1'` → `producto1Id: 'sust-1'`, `sustrato2Id: 'sust-2'` → `producto2Id: 'sust-2'` (values `'sust-*'` stay)
- `controller.getMezcla(mockUser, 'mezcla-1')` → `controller.getFormula(mockUser, 'formula-1')`
- expectation (Phase 1, order intentionally still wrong — Task 6 fixes): `expect(service.getFormulaById).toHaveBeenCalledWith('user-1', 'formula-1');`
- describe titles: `getAllMezcla`→`getAllFormula`, `getMezcla`→`getFormula`, `createMezcla`→`createFormula`
- create `data` object keys → `producto1Id`/`producto2Id`
- `service.createMezcla.mockResolvedValue` → `service.createFormula.mockResolvedValue`; `controller.createFormula(data)`; `expect(service.createFormula).toHaveBeenCalledWith(data)`

`__tests__/formula.service.spec.ts`:
- `mockMezcla` → `mockFormula`; `id: 'mezcla-1'` → `'formula-1'`; keys → `producto1Id: 'sust-1'`, `producto1Nombre: 'Turba'`, `producto2Id: 'sust-2'`, `producto2Nombre: 'Perlita'`, …
- `service.getAllMezcla` → `service.getAllFormula` (describe + calls)
- `service.getMezclaById('mezcla-1', 'user-1')` → `service.getFormulaById('formula-1', 'user-1')`; `repo.findById` called with `('formula-1', 'user-1')`; `'nonexistent'` cases keep
- any `'Mezcla not found'` string → `'Formula not found'`
- `describe('createMezcla')` → `describe('createFormula')`; `service.createMezcla(data)` → `service.createFormula(data)`
- create `data` keys → `producto1Id`/`producto2Id`

`__tests__/formula.repository.spec.ts` (Phase 1 mechanical; Task 7 rewrites it):
- prisma mock key `mezcla: { findMany, findUnique, create }` → `formula: { … }`; all `prisma.mezcla.*` → `prisma.formula.*`
- `mockRecordWithRelations` / `mockDto`: `id: 'mezcla-1'` → `'formula-1'`; keys `sustrato1Id`→`producto1Id`, `sustrato1: { nombre: 'Turba' }`→`producto1: …`, `sustrato1Nombre`→`producto1Nombre` (…all 4 slots)
- `include` assertions: `sustrato1: { select: { nombre: true } }` → `producto1: …` (×4, in both findAll and findById expectations)
- `repository.findById('mezcla-1', 'user-1')` → `('formula-1', 'user-1')`
- titles: `with sustrato names` → `with producto names`
- create `data` keys → `producto1Id`/`producto2Id`

- [ ] **Step 13: Rename + update integration tests and helpers**

```bash
git mv apps/backend/test/integration/mezcla.integration.spec.ts apps/backend/test/integration/formula.integration.spec.ts
git mv apps/backend/test/integration/sustratos.integration.spec.ts apps/backend/test/integration/productos.integration.spec.ts
```

`test/integration/fixtures/fixtures.ts`:
- comment `// ── Mezcla ──` → `// ── Formula ──`
- `validCreateMezclaPayload` → `validCreateFormulaPayload`; keys `sustrato1Id`…`sustrato4Id` → `producto1Id`…`producto4Id` (cuid **values** unchanged)
- `mockMezclaDto` → `mockFormulaDto`; `id: 'clmezclamoc000000000000'` → `id: 'clformulamoc000000000000'`; keys → `producto1Id`/`producto1Nombre`/… (names `'Turf'`/`'Perlite'` unchanged)
- siembraPartida fixture: `mezclaId:` → `formulaId:`, `mezclaNombre:` → `formulaNombre:`
- comment `// ── Sustratos ──` → `// ── Productos ──`
- `validCreateSustratoPayload` → `validCreateProductoPayload`, `validUpdateSustratoPayload` → `validUpdateProductoPayload`, `mockSustratoDto` → `mockProductoDto` (id value `'clsusmoc…'` stays — no audit hit)

`test/integration/helpers/mock-factories.ts`:
- `createMezclaMock` → `createFormulaMock` with keys `getAllFormula`, `getFormulaById`, `createFormula`
- `createSustratosMock` → `createProductosMock` with keys `getAllProductos`, `getProductoById`, `createProducto`, `updateProducto`

`test/integration/helpers/create-app.ts`:
- imports: `FormulaController`/`FormulaService` from `../../src/modules/formula/formula.controller|service`; `ProductosController`/`ProductosService` from `../../src/modules/productos/productos.controller|service`
- `ServiceOverrides`: `mezcla?: ReturnType<typeof createFormulaMock>;` → `formula?: …`; `sustratos?: ReturnType<typeof createProductosMock>;` → `productos?: …`
- local vars `mezclaMock` → `formulaMock` (`overrides?.formula ?? createFormulaMock()`), `sustratosMock` → `productosMock` (`overrides?.productos ?? createProductosMock()`)
- controllers array: `FormulaController`, `ProductosController`; providers: `{ provide: FormulaService, useValue: formulaMock }`, `{ provide: ProductosService, useValue: productosMock }`

`formula.integration.spec.ts` (was mezcla…):
- header; imports `createFormulaMock`, `validCreateFormulaPayload, mockFormulaDto`
- `describe('Formula (integration)')`; `let formulaMock: ReturnType<typeof createFormulaMock>;` `formulaMock = createFormulaMock();` `app = await createTestApp({ formula: formulaMock });`
- all URLs `'/mezcla'` → `'/formula'`; id URL `'/formula/clformulamoc000000000000'`
- mock methods `getAllMezcla`→`getAllFormula`, `getMezclaById`→`getFormulaById`, `createMezcla`→`createFormula`
- titles/strings: `array of mezclas`→`array of fórmulas`, `no mezclas`→`no fórmulas`, `mezcla by id`→`fórmula by id`, `mezcla not found`→`fórmula not found`, `NotFoundException('Mezcla not found')`→`('Formula not found')`
- inline payload keys `sustratoNId` → `productoNId` (missing-sustrato1Id test + sum test; titles `missing sustrato1Id`→`missing producto1Id`); `createFormula` called-with assertions keys → `productoNId`
- `toHaveProperty('id', 'clformulamoc000000000000')`

`productos.integration.spec.ts` (was sustratos…):
- header; imports `createProductosMock`, renamed fixtures
- `describe('Productos (integration)')`; `productosMock`; `createTestApp({ productos: productosMock })`
- all URLs `'/sustratos'` → `'/productos'` (id URLs keep `clsusmoc…` values)
- mock methods `getAllSustratos`→`getAllProductos`, `getSustratoById`→`getProductoById`, `createSustrato`→`createProducto`, `updateSustrato`→`updateProducto`
- titles: `list of sustratos`→`list of productos`, `no sustratos exist`→`no productos exist`, `created sustrato`→`created producto`, `sustrato when found`→`producto when found`, `sustrato not found`→`producto not found`, `updated sustrato`→`updated producto`

`programacionSiembra.integration.spec.ts`:
- line 76: `mezclaId: 'clmocksiembra0000000000000',` → `formulaId: 'clmocksiembra0000000000000',`
- **DO NOT TOUCH** line 68 `sustrato: 'sustrato1',`

- [ ] **Step 14: Gate — backend**

```bash
rg -i 'mezcla' apps/backend/src apps/backend/test --glob '!**/node_modules/**'
pnpm --filter backend type-check
pnpm --filter backend test
pnpm --filter backend test:integration
```

Expected: first command → no matches; type-check clean; unit + integration all PASS.

---

## Task 4: Frontend rename (Phase 1, Layer 3)

**Files:**
- Rename dir: `apps/frontend/src/features/mezclas` → `features/formulas` (10 file renames inside)
- Rename dir: `apps/frontend/src/features/sustratos` → `features/productos` (10 file renames inside)
- Rename: `apps/frontend/src/app/(dashboard)/mezclas/page.tsx` → `…/formulas/page.tsx`; `…/sustratos/page.tsx` → `…/productos/page.tsx`
- Rename: `apps/frontend/src/features/programacionSiembra/components/mezclaSelector.tsx` → `formulaSelector.tsx`
- Modify: `apps/frontend/src/lib/{queryKeys.ts, query-invalidation-map.ts, config/navigations.ts}`, `constants/routes.ts`, `lib/export/__tests__/export-columns.test.ts`
- Modify: `features/programacionSiembra/components/__tests__/{mezaSelector.test.tsx, siembra-data-table.test.tsx}`
- Modify: `features/siembraPartidas/components/siembra-partidas-registradas-view-form.tsx` + its 2 tests

**Interfaces:**
- Consumes: Task 1 exports and Task 3 endpoints (`GET|POST "formula"`, `GET|POST "productos"`).
- Produces: routes `/formulas` + `/productos`; components `FormulaDataTable`, `FormulaCreateForm`, `FormulaViewForm`, `FormulasDashboard`, `FormulaSelector`, `ProductoDataTable`, `ProductoCreateForm`, `ProductoViewForm`, `ProductosDashboard`; hooks `useFormulas`, `useCreateFormula`, `useProductos`, `useCreateProducto`; services `formulaService`, `productoService`; query keys `formulaQueryKeys` (`["formulas"]`), `productoQueryKeys` (`["productos"]`); invalidation keys `createFormula` / `createProducto`; `ROUTES.FORMULAS` / `ROUTES.PRODUCTOS`.

**DO NOT TOUCH (whole feature):** `features/aSembrar/**`, `programacionSiembra/components/sustratoSearch.tsx`, `programacionSiembra/hooks/useLegacySustratos.ts`, `programacionSiembra/api/programacionSiembraService.ts` (legacy fetchers).

- [ ] **Step 1: Rename feature dirs, pages, selector files**

```bash
git mv apps/frontend/src/features/mezclas apps/frontend/src/features/formulas
git mv apps/frontend/src/features/formulas/api/mezclaService.ts apps/frontend/src/features/formulas/api/formulaService.ts
git mv apps/frontend/src/features/formulas/hooks/useMezclas.ts apps/frontend/src/features/formulas/hooks/useFormulas.ts
git mv apps/frontend/src/features/formulas/components/mezcla-create-form.tsx apps/frontend/src/features/formulas/components/formula-create-form.tsx
git mv apps/frontend/src/features/formulas/components/mezcla-data-table.tsx apps/frontend/src/features/formulas/components/formula-data-table.tsx
git mv apps/frontend/src/features/formulas/components/MezclasDashboard.tsx apps/frontend/src/features/formulas/components/FormulasDashboard.tsx
git mv apps/frontend/src/features/formulas/components/mezcla-view-form.tsx apps/frontend/src/features/formulas/components/formula-view-form.tsx
git mv apps/frontend/src/features/formulas/components/__tests__/mezcla-data-table.test.tsx apps/frontend/src/features/formulas/components/__tests__/formula-data-table.test.tsx
git mv apps/frontend/src/features/formulas/components/__tests__/mezcla-view-form.test.tsx apps/frontend/src/features/formulas/components/__tests__/formula-view-form.test.tsx
git mv apps/frontend/src/features/formulas/__tests__/mezclaService.test.ts apps/frontend/src/features/formulas/__tests__/formulaService.test.ts

git mv apps/frontend/src/features/sustratos apps/frontend/src/features/productos
git mv apps/frontend/src/features/productos/api/sustratoService.ts apps/frontend/src/features/productos/api/productoService.ts
git mv apps/frontend/src/features/productos/hooks/useSustratos.ts apps/frontend/src/features/productos/hooks/useProductos.ts
git mv apps/frontend/src/features/productos/components/sustrato-create-form.tsx apps/frontend/src/features/productos/components/producto-create-form.tsx
git mv apps/frontend/src/features/productos/components/sustrato-data-table.tsx apps/frontend/src/features/productos/components/producto-data-table.tsx
git mv apps/frontend/src/features/productos/components/SustratosDashboard.tsx apps/frontend/src/features/productos/components/ProductosDashboard.tsx
git mv apps/frontend/src/features/productos/components/sustrato-view-form.tsx apps/frontend/src/features/productos/components/producto-view-form.tsx
git mv apps/frontend/src/features/productos/components/__tests__/sustrato-data-table.test.tsx apps/frontend/src/features/productos/components/__tests__/producto-data-table.test.tsx
git mv apps/frontend/src/features/productos/components/__tests__/sustrato-view-form.test.tsx apps/frontend/src/features/productos/components/__tests__/producto-view-form.test.tsx
git mv apps/frontend/src/features/productos/__tests__/sustratoService.test.ts apps/frontend/src/features/productos/__tests__/productoService.test.ts

git mv "apps/frontend/src/app/(dashboard)/mezclas" "apps/frontend/src/app/(dashboard)/formulas"
git mv "apps/frontend/src/app/(dashboard)/sustratos" "apps/frontend/src/app/(dashboard)/productos"
git mv apps/frontend/src/features/programacionSiembra/components/mezclaSelector.tsx apps/frontend/src/features/programacionSiembra/components/formulaSelector.tsx
```

- [ ] **Step 2: Write `formulaService.ts` (complete file)**

```typescript
// apps/frontend/src/features/formulas/api/formulaService.ts
import { clientFetch } from "@/lib/api/client-fetch";
import { CreateFormulaDto, FormulaDto } from "@vivero/shared";

export const formulaService = {
  fetchAll: () => {
    return clientFetch<FormulaDto[]>("formula", { method: "GET" });
  },

  create: (data: CreateFormulaDto) => {
    return clientFetch<FormulaDto>("formula", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
```

- [ ] **Step 3: Write `useFormulas.ts` (complete file)**

```typescript
// apps/frontend/src/features/formulas/hooks/useFormulas.ts
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { CreateFormulaDto, FormulaDto } from "@vivero/shared";
import { toast } from "sonner";
import { formulaService } from "../api/formulaService";
import { formulaQueryKeys } from "@/lib/queryKeys";
import { invalidateQueries } from "@/lib/query-invalidation-map";

export const useFormulas = () => {
  return useSuspenseQuery<FormulaDto[]>({
    queryKey: formulaQueryKeys.all(),
    queryFn: formulaService.fetchAll,
    retry: 1,
  });
};

export const useCreateFormula = () => {
  const queryClient = useQueryClient();

  return useMutation<FormulaDto, Error, CreateFormulaDto>({
    mutationFn: formulaService.create,
    onSuccess: () => {
      toast.success("Fórmula creada exitosamente", {
        duration: 3000,
      });
      invalidateQueries(queryClient, "createFormula");
    },
  });
};
```

- [ ] **Step 4: Write `formulas/index.ts` and `FormulasDashboard.tsx` (complete files)**

`apps/frontend/src/features/formulas/index.ts`:

```typescript
// apps/frontend/src/features/formulas/index.ts

// Components
export { FormulasDashboard } from "./components/FormulasDashboard";

// Hooks
export { useFormulas, useCreateFormula } from "./hooks/useFormulas";

// Services
export { formulaService } from "./api/formulaService";
```

`apps/frontend/src/features/formulas/components/FormulasDashboard.tsx`:

```typescript
// apps/frontend/src/features/formulas/components/FormulasDashboard.tsx
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { FormulaDataTable } from "./formula-data-table";
import { formulaColumns } from "./columns";
import { LoadingBoundary } from "@/components/common/loading-boundary";

export function FormulasDashboard() {
  return (
    <div className="flex flex-col gap-3 xl:gap-4">
      <LoadingBoundary
        skeleton={<DataTableSkeleton columnCount={formulaColumns.length} />}
      >
        <FormulaDataTable />
      </LoadingBoundary>
    </div>
  );
}
```

- [ ] **Step 5: Rewrite `formula-create-form.tsx`**

`apps/frontend/src/features/formulas/components/formula-create-form.tsx` — exact edits over the old file:

1. Header comment → `…/formulas/components/formula-create-form.tsx`
2. Import line: `import { CreateFormulaDto, ProductoDto } from "@vivero/shared";`
3. `FormProps`: `productos: ProductoDto[];`
4. Rename component `SustratoSlot` → `ProductoSlot` (declaration + type refs), internals:
   - `form: UseFormReturn<CreateFormulaDto>;`
   - `productos: ProductoDto[];`
   - `const productoField = \`producto${index}Id\` as const;` (was `sustrato${index}Id`)
   - `value={form.watch(productoField)}` usage: `disabled={!form.watch(productoField)}`
   - `SelectValue placeholder="Seleccionar producto"`
   - `{productos.map((s) => (…` (keep loop var `s`)
5. Exported function `MezclaCreateForm` → `FormulaCreateForm`; destructure `productos`
6. Four slot usages:

```tsx
        <ProductoSlot form={form} index={1} productos={productos} label="Producto 1" />
        <ProductoSlot form={form} index={2} productos={productos} label="Producto 2" />
        <ProductoSlot form={form} index={3} productos={productos} label="Producto 3" />
        <ProductoSlot form={form} index={4} productos={productos} label="Producto 4" />
```

7. FormDescription text: `Los porcentajes deben sumar 100% para poder crear la fórmula.`

- [ ] **Step 6: Rewrite `formula-data-table.tsx`**

`apps/frontend/src/features/formulas/components/formula-data-table.tsx` — exact edits over the old file:

1. Header comment
2. Imports: `import { useCreateFormula, useFormulas } from "../hooks/useFormulas";`
   `import { useProductos } from "@/features/productos/hooks/useProductos";`
   `import { CreateFormulaDto, CreateFormulaSchema, FormulaDto, fieldLabels } from "@vivero/shared";`
   `import { formulaColumns, formulaExportColumns } from "./columns";`
   `import { FormulaCreateForm } from "./formula-create-form";`
   `import { FormulaViewForm } from "./formula-view-form";`
3. `export function FormulaDataTable() {`
4. `const { data: formulas = [] } = useFormulas();` / `const { data: productos = [] } = useProductos();`
5. `const [selectedFormula, setSelectedFormula] = useState<FormulaDto | null>(null);`
6. `const { mutateAsync: createFormula, isPending: isCreatingFormula } = useCreateFormula();`
7. `const formCreateFormula = useForm<CreateFormulaDto>({ resolver: zodResolver(CreateFormulaSchema), defaultValues: { producto1Id: "", porcentaje1: 0, producto2Id: null, porcentaje2: null, producto3Id: null, porcentaje3: null, producto4Id: null, porcentaje4: null } });`
8. `handleNewFormula` (declaration + `formCreateFormula.reset()`); `handleView(row: FormulaDto)` sets `setSelectedFormula(row)`
9. `handleCreate`: `await createFormula(formData);` / `if (!isCreatingFormula) setSlideOverOpen(false);`
10. `<DataTable … columns={formulaColumns} exportColumns={formulaExportColumns} data={formulas} title="Fórmulas" description="Gestión de fórmulas del sistema" tableName="programacion_siembra" totalCount={formulas.length} onCreate={handleNewFormula} createLabel="Nueva Fórmula" onView={handleView} columnLabels={fieldLabels.Formula} />`
11. SlideOverForm: `form={mode === "create" ? formCreateFormula : undefined}`, title create `"Crear fórmula"` / view `` `Fórmula: ${selectedFormula?.producto1Nombre}` ``, description `"Rellena los campos para crear una nueva fórmula."`, `saveLabel="Crear Fórmula"`, `fieldLabels={fieldLabels.CreateFormula}`, confirm `{ title: "Crear fórmula", description: "¿Deseas crear esta nueva fórmula?", summaryFields: ["producto1Id", "porcentaje1", "producto2Id", "porcentaje2", "producto3Id", "porcentaje3", "producto4Id", "porcentaje4"] }`
12. Body: `<FormulaCreateForm form={formCreateFormula} onSubmit={handleCreate} onCancel={() => setSlideOverOpen(false)} formId="create" productos={productos} totalPorcentaje={totalPorcentaje} />` / `<FormulaViewForm selectedFormula={selectedFormula} />`

**Keep unchanged:** `try { … } catch {}`, `tableName="programacion_siembra"`, `useWatch`/`totalPorcentaje` logic.

- [ ] **Step 7: Rewrite `formula-view-form.tsx` and `columns.tsx`**

`formula-view-form.tsx`:
1. Header comment; `import { FormulaDto } from "@vivero/shared";`
2. `interface FormulaViewFormProps { selectedFormula: FormulaDto; }`
3. `export function FormulaViewForm({ selectedFormula }: FormulaViewFormProps) {`
4. `compositionSummary`: 4 lines using `selectedFormula.productoNNombre` / `selectedFormula.porcentajeN`
5. Header `<h2>` text: `Fórmula` (was `Mezcla`)
6. Four `<CompositionRow>`: `label="Producto 1" … label="Producto 4"`; `nombre={selectedFormula.productoNNombre}`; `porcentaje={selectedFormula.porcentajeN}`
7. `new Date(selectedFormula.createdAt)`

`columns.tsx`:
1. Header comment; `import { FormulaDto } from "@vivero/shared";`
2. Rename `SustratoCell` → `ProductoCell` (declaration + 4 usages); `MezclaDto` → `FormulaDto` in `CellProps`
3. `export const formulaColumns: ColumnDef<FormulaDto>[] = [` — per slot (×4):
   - `accessorKey: "productoNNombre"`, header `<SortableHeader>Producto N</SortableHeader>`, cell `<ProductoCell row={row} field="productoNNombre" />`
   - percent columns unchanged (`porcentajeN`, `%N`)
4. `export const formulaExportColumns: ExportColumn<FormulaDto>[] = [` — per slot (×4): `accessorKey: "productoNNombre"`, `exportHeader: "Producto N"`, `exportValue: (_, row) => row.productoNNombre || ""` (pdfWidths unchanged)
5. `createdAt` columns unchanged

- [ ] **Step 8: Update formula feature tests**

`__tests__/formulaService.test.ts`:
- import `formulaService` from `"../api/formulaService"`; `describe("formulaService")`
- `it("fetchAll calls GET /formula")` → expect `clientFetch` called with `"formula", { method: "GET" }`
- `it("create calls POST /formula with body")`; data keys → `producto1Id`/`producto2Id`/…; response keys `producto1Nombre: "Turba"`, `producto2Nombre: null`, … ; expect called with `"formula", { method: "POST", … }`

`components/__tests__/formula-data-table.test.tsx`:
- header comment
- `import { FormulaDataTable } from "../formula-data-table";` `import type { FormulaDto } from "@vivero/shared";`
- mock paths/names: `jest.mock("@/features/formulas/hooks/useFormulas", () => ({ useFormulas: () => ({ data: mockFormulas }), useCreateFormula: () => ({ mutateAsync: …, isPending: false }) }))`
- `jest.mock("@/features/productos/hooks/useProductos", () => ({ useProductos: () => ({ data: [{ id: "p1", nombre: "Turba", createdAt: new Date() }] }) }))`
- `const mockFormulas: FormulaDto[] = [ { id: "1", producto1Id: "s1", producto1Nombre: "Turba", … producto4…, isActive, createdAt } ]`
- `describe("FormulaDataTable")`; assertion `screen.getByText("Fórmulas")` (was `"Mezclas"`)

`components/__tests__/formula-view-form.test.tsx`:
- header; `import { FormulaViewForm } from "../formula-view-form";`
- `const mockFormula: FormulaDto = { id: "1", producto1Id: "s1", producto1Nombre: "Turba", porcentaje1: 60, producto2Id: "s2", producto2Nombre: "Perlita", porcentaje2: 40, producto3Id: null, producto3Nombre: null, porcentaje3: null, producto4Id: null, producto4Nombre: null, porcentaje4: null, isActive: true, createdAt: new Date("2024-03-14") };`
- `describe("FormulaViewForm")`; all renders: `selectedFormula={mockFormula}`
- title: `should display producto names and percentages` (assertions on Turba/Perlita/60%/40% unchanged)

- [ ] **Step 9: Rewrite `productoService.ts`, `useProductos.ts`, `productos/index.ts`, `ProductosDashboard.tsx` (complete files)**

`apps/frontend/src/features/productos/api/productoService.ts`:

```typescript
// apps/frontend/src/features/productos/api/productoService.ts
import { clientFetch } from "@/lib/api/client-fetch";
import { CreateProductoDto, ProductoDto } from "@vivero/shared";

export const productoService = {
  fetchAll: () => {
    return clientFetch<ProductoDto[]>("productos", { method: "GET" });
  },

  create: (data: CreateProductoDto) => {
    return clientFetch<ProductoDto>("productos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
```

`apps/frontend/src/features/productos/hooks/useProductos.ts`:

```typescript
// apps/frontend/src/features/productos/hooks/useProductos.ts
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { CreateProductoDto, ProductoDto } from "@vivero/shared";
import { toast } from "sonner";
import { productoService } from "../api/productoService";
import { productoQueryKeys } from "@/lib/queryKeys";
import { invalidateQueries } from "@/lib/query-invalidation-map";

export const useProductos = () => {
  return useSuspenseQuery<ProductoDto[]>({
    queryKey: productoQueryKeys.all(),
    queryFn: productoService.fetchAll,
    retry: 1,
  });
};

export const useCreateProducto = () => {
  const queryClient = useQueryClient();

  return useMutation<ProductoDto, Error, CreateProductoDto>({
    mutationFn: productoService.create,
    onSuccess: (data) => {
      toast.success(`Producto ${data.nombre} creado exitosamente`, {
        duration: 3000,
      });
      invalidateQueries(queryClient, "createProducto");
    },
  });
};
```

`apps/frontend/src/features/productos/index.ts`:

```typescript
// apps/frontend/src/features/productos/index.ts

// Components
export { ProductosDashboard } from "./components/ProductosDashboard";

// Hooks
export { useProductos, useCreateProducto } from "./hooks/useProductos";

// Services
export { productoService } from "./api/productoService";
```

`apps/frontend/src/features/productos/components/ProductosDashboard.tsx`:

```typescript
// apps/frontend/src/features/productos/components/ProductosDashboard.tsx
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { ProductoDataTable } from "./producto-data-table";
import { productoColumns } from "./columns";
import { LoadingBoundary } from "@/components/common/loading-boundary";

export function ProductosDashboard() {
  return (
    <div className="flex flex-col gap-3 xl:gap-4">
      <LoadingBoundary
        skeleton={<DataTableSkeleton columnCount={productoColumns.length} />}
      >
        <ProductoDataTable />
      </LoadingBoundary>
    </div>
  );
}
```

- [ ] **Step 10: Rewrite `producto-data-table.tsx`, `producto-create-form.tsx`, `producto-view-form.tsx`, `columns.tsx`**

`producto-data-table.tsx` (edits over the old file):
1. Header comment; imports: `import { useCreateProducto, useProductos } from "../hooks/useProductos";`, shared `{ CreateProductoDto, CreateProductoSchema, ProductoDto, fieldLabels }`, `productoColumns, productoExportColumns` from `"./columns"`, `ProductoCreateForm`, `ProductoViewForm`
2. `export function ProductoDataTable() {`; `const { data: productos = [] } = useProductos();`; `selectedProducto`; `createProducto`/`isCreatingProducto`; `formCreateProducto`
3. `handleNewProducto`, `handleView(row: ProductoDto)`, `handleCreate` (`await createProducto(…)`, `if (!isCreatingProducto) …`)
4. DataTable props: `title="Productos"`, `description="Gestión de productos del sistema"`, `tableName="productos"`, `createLabel="Nuevo Producto"`, `columnLabels={fieldLabels.Producto}`
5. SlideOver: `form={formCreateProducto}`, titles `"Crear producto"` / `` `Producto: ${selectedProducto?.nombre}` ``, description `"Rellena los campos para crear un nuevo producto."`, `saveLabel="Crear Producto"`, `fieldLabels={fieldLabels.CreateProducto}`, confirm `{ title: "Crear producto", description: "¿Deseas crear este nuevo producto?" }`
6. Body: `<ProductoCreateForm … />` / `<ProductoViewForm selectedProducto={selectedProducto} />`
7. **Keep:** `try { … } catch {}`

`producto-create-form.tsx`:
1. Header; `import { CreateProductoDto } from "@vivero/shared";`
2. `export function ProductoCreateForm({ onSubmit, formId, form }: FormProps)`
3. placeholder: `ej: Producto Premium`
4. FormDescription: `Nombre descriptivo del producto. Ej: &quot;Producto Turba&quot;.`

`producto-view-form.tsx`:
1. Header; `import { ProductoDto } from "@vivero/shared";`
2. `interface ProductoViewFormProps { selectedProducto: ProductoDto; }`
3. `export function ProductoViewForm({ selectedProducto }: ProductoViewFormProps)`
4. Header subtitle `<p>` text: `Producto` (was `Sustrato`)
5. `value={selectedProducto.nombre}` / `new Date(selectedProducto.createdAt)`

`columns.tsx`:
1. Header; `ProductoDto` type; rename `sustratoColumns` → `productoColumns`, `sustratoExportColumns` → `productoExportColumns` (headers `Nombre`/`Creado` and pdfWidths unchanged)

- [ ] **Step 11: Update producto feature tests**

`components/__tests__/producto-data-table.test.tsx`:
- header; `import { ProductoDataTable } from "../producto-data-table";`; `ProductoDto`
- mock: `jest.mock("@/features/productos/hooks/useProductos", () => ({ useProductos: () => ({ data: mockProductos }), useCreateProducto: () => ({ … }) }))`
- `const mockProductos: ProductoDto[] = [ { id: "1", nombre: "Producto Test", createdAt: "2024-03-15T00:00:00.000Z" } ];`
- `describe("ProductoDataTable")`; assertion `screen.getByText("Productos")`

`components/__tests__/producto-view-form.test.tsx`:
- header; `import { ProductoViewForm } from "../producto-view-form";`; `ProductoDto`
- `const mockProducto: ProductoDto = { id: "1", nombre: "Producto Test", createdAt: … };`
- `describe("ProductoViewForm")`; renders `selectedProducto={mockProducto}`; title `should display producto nombre in header`; `getAllByText("Producto Test")`

`__tests__/productoService.test.ts`:
- import `productoService`; `describe("productoService")`
- `it("fetchAll calls GET /productos")` → expect `"productos", { method: "GET" }`
- `it("create calls POST /productos with body")`; `const data = { nombre: "Producto Test" };` → expect `"productos", { method: "POST", … }`

- [ ] **Step 12: Update pages**

`apps/frontend/src/app/(dashboard)/formulas/page.tsx` (complete file):

```tsx
// apps/frontend/src/app/(dashboard)/formulas/page.tsx

import { FormulasDashboard } from "@/features/formulas";

export const dynamic = "force-dynamic";

export default function FormulasPage() {
  return <FormulasDashboard />;
}
```

`apps/frontend/src/app/(dashboard)/productos/page.tsx` (complete file):

```tsx
// apps/frontend/src/app/(dashboard)/productos/page.tsx

import { ProductosDashboard } from "@/features/productos";

export const dynamic = "force-dynamic";

export default function ProductosPage() {
  return <ProductosDashboard />;
}
```

- [ ] **Step 13: Update `queryKeys.ts`, `query-invalidation-map.ts`, `routes.ts`**

`apps/frontend/src/lib/queryKeys.ts` (was lines 105–119):

```typescript
// ============================================================================
// PRODUCTOS
// ============================================================================

export const productoQueryKeys = {
  all: () => ["productos"] as const,
};

// ============================================================================
// FORMULAS
// ============================================================================

export const formulaQueryKeys = {
  all: () => ["formulas"] as const,
};
```

`apps/frontend/src/lib/query-invalidation-map.ts`:
- imports: `productoQueryKeys,` `formulaQueryKeys,` (replacing `sustratoQueryKeys`, `mezclaQueryKeys`)
- entries (was lines 104–112):

```typescript
  // --- Productos ---
  createProducto: {
    queries: () => [productoQueryKeys.all()],
  },

  // --- Fórmulas ---
  createFormula: {
    queries: () => [formulaQueryKeys.all()],
  },
```

`apps/frontend/src/constants/routes.ts` lines 13–14:

```typescript
  PRODUCTOS: "/productos",
  FORMULAS: "/formulas",
```

- [ ] **Step 14: Update `navigations.ts`**

`apps/frontend/src/lib/config/navigations.ts` — replace the subGroup block (was lines 66–89) with:

```typescript
      {
        kind: "subGroup",
        id: "productos",
        title: "Productos",
        icon: Package,
        items: [
          {
            title: "Lista",
            href: ROUTES.PRODUCTOS,
            icon: Package,
            description: "Gestión de productos",
            dashboard: { statsLabel: "Productos" },
            requiredPermission: { table: "productos", action: "read" },
          },
          {
            title: "Fórmulas",
            href: ROUTES.FORMULAS,
            icon: Blend,
            description: "Gestión de fórmulas",
            dashboard: { statsLabel: "Fórmulas" },
            requiredPermission: { table: "formulas", action: "read" },
          },
        ],
      },
```

(icons `Package`/`Blend` imports unchanged; nothing else in the file changes.)

- [ ] **Step 15: Update `export-columns.test.ts`**

`apps/frontend/src/lib/export/__tests__/export-columns.test.ts`:
- `import { productoExportColumns } from "@/features/productos/components/columns";`
- `import { formulaExportColumns } from "@/features/formulas/components/columns";`
- array entries: `["productos", productoExportColumns as ExportColumn<never>[]],` and `["formulas", formulaExportColumns as ExportColumn<never>[]],`

- [ ] **Step 16: Update `formulaSelector.tsx`**

`apps/frontend/src/features/programacionSiembra/components/formulaSelector.tsx` (edits over the old file):
1. Header comment → `…/formulaSelector.tsx`
2. `import { useFormulas } from "@/features/formulas";`
3. `interface FormulaSelectorProps { … }`
4. `export function FormulaSelector({ form, fieldName = "formulaId" }: FormulaSelectorProps) {`
5. `const { data: formulas = [] } = useFormulas();` / `const activeFormulas = formulas.filter((f) => f.isActive);`
6. `getCompositionLabel = (formula: (typeof activeFormulas)[0])` → parts array `formula.producto1Nombre` … `formula.producto4Nombre`
7. Label text: `Fórmula` (was `Mezcla`)
8. `<SelectValue placeholder="Seleccione fórmula" />`
9. `{activeFormulas.map((formula) => (<SelectItem key={formula.id} value={formula.id} …>{getCompositionLabel(formula)}</SelectItem>))}`

- [ ] **Step 17: Update programacionSiembra tests**

`components/__tests__/mezaSelector.test.tsx` (filename keeps its typo — no audit hit):
- `jest.mock("@/features/formulas", () => ({ useFormulas: () => ({ data: [ … ] }) }))`; fixture keys → `producto1Id`/`producto1Nombre`/… `producto4*` (ids `m1`/`m2`, nombres Turba/Perlita/Coco unchanged)
- `import { FormulaSelector } from "../formulaSelector";`
- `describe("FormulaSelector")`; `render(<FormulaSelector form={mockForm} />)` in all 3 tests
- assertions: `screen.getByText("Fórmula")`, `screen.getByText("Seleccione fórmula")`, `it("only renders active fórmulas")` (Turba / Perlita + queryByText("Coco") unchanged)

`components/__tests__/siembra-data-table.test.tsx` lines 16–17:

```typescript
jest.mock("../formulaSelector", () => ({
  FormulaSelector: () => <div data-testid="formula-selector" />,
}));
```

- [ ] **Step 18: Update siembraPartidas view form + tests**

`features/siembraPartidas/components/siembra-partidas-registradas-view-form.tsx` (commented-out block, lines 158–165):

```tsx
                  {/* until we implement fórmula
                  <InfoRow
                    icon={FlaskConical}
                    label="Fórmula"
                    value={selectedPartida.formulaNombre}
                    className="border-primary/5"
                  />
                  */}
```

`components/__tests__/siembra-partidas-registradas-view-form.test.tsx`: mock keys `mezclaId: "mezcla-1",` → `formulaId: "formula-1",`, `mezclaNombre: "Tierra (70%) + Perlita (30%)",` → `formulaNombre: "Tierra (70%) + Perlita (30%)",` (line 16/18).

`components/__tests__/siembra-partidas-registradas-data-table.test.tsx`: same two replacements (lines 23/25).

- [ ] **Step 19: Gate — frontend**

```bash
rg -i 'mezcla' apps/frontend/src
pnpm --filter frontend type-check
pnpm --filter frontend test
```

Expected: first command → no matches; type-check clean; jest PASS.

---

## Task 5: Boundary audit + Phase 1 monorepo gates

- [ ] **Step 1: Audit for stray `mezcla`**

```bash
rg -i 'mezcla' apps packages --glob '!**/prisma/migrations/**' --glob '!**/node_modules/**'
```

Expected: **no matches anywhere.** Any hit = under-rename → fix before proceeding.

- [ ] **Step 2: Audit for `sustrato` against the allowlist**

```bash
rg -i 'sustrato' apps packages --glob '!**/node_modules/**' -l
```

Expected files (nothing else):

- `apps/backend/prisma/migrations/**` (historical SQL)
- `apps/backend/prisma/schema/siembraPartidas.prisma` (`prensadoSustrato`, `sustrato String?` — hard boundaries)
- `apps/backend/src/app.module.ts` (`LegacySustratoModule` import — hard boundary `LegacySustrato*`)
- `apps/frontend/src/lib/queryKeys.ts` (`legacySustratos` key — hard boundary)
- `apps/backend/src/infra/legacy-mysql/**`
- `apps/backend/src/modules/legacy/**` (incl. `legacy/sustrato/**`, `partidas.service.ts` `sustrato: data.sustrato`)
- `apps/backend/src/modules/permissions/__tests__/permissions.guard.spec.ts` (arbitrary `'sustratos'` mock value)
- `apps/backend/src/modules/siembraPartidas/**` (`prensadoSustrato`, `sustrato`, `sustratoNombre`, `buildSustratoNombre`, `GENERIC_SUSTRATO_NAME`, `'Sustrato Genérico'`, test fixture strings)
- `apps/backend/test/integration/fixtures/fixtures.ts` + `programacionSiembra.integration.spec.ts` (siembraPartida `sustrato` fields)
- `apps/frontend/src/features/aSembrar/**`
- `apps/frontend/src/features/programacionSiembra/{sustratoSearch.tsx, hooks/useLegacySustratos.ts, api/programacionSiembraService.ts}`
- `apps/frontend/src/features/siembraPartidas/**` (siembraPartida `sustrato` fields)
- `packages/shared/src/schemas/{siembraPartida.schema.ts, programacionSiembra.schema.ts, field-labels.ts}` + their specs (siembraPartida fields / LegacySustrato / `"sustrato: \"Sustrato\""` / `prensadoSustrato`)
- `packages/shared/src/schemas/{formula.schema.ts, productos.schema.ts}` + their specs (**validation messages kept until Task 8**)
- `docs/` (history)

Any file outside this list = over-rename or under-rename → fix.

- [ ] **Step 3: Phase 1 monorepo gates**

```bash
pnpm lint && pnpm type-check && pnpm test
pnpm --filter backend test:integration
```

Expected: lint/type-check/test all PASS (integration re-runs the backend suite end-to-end). **Checkpoint: Phase 1 complete — review before Phase 2.**

---

## Task 6: Phase 2 — fix `GET /:id` argument order (TDD)

**Files:**
- Test: `apps/backend/src/modules/formula/__tests__/formula.controller.spec.ts`
- Modify: `apps/backend/src/modules/formula/formula.controller.ts`

**Interfaces:**
- Consumes: Task 3 `FormulaService.getFormulaById(id, requesterId)` (already `(id, requesterId)` — correct; only the controller call is wrong).
- Produces: corrected `FormulaController.getFormula` behavior — lookup runs with the formula id.

- [ ] **Step 1: Fix the test expectation (write the failing test first)**

In `formula.controller.spec.ts`, inside `describe('getFormula')`:

```typescript
      expect(service.getFormulaById).toHaveBeenCalledWith('formula-1', 'user-1');
```

(was `toHaveBeenCalledWith('user-1', 'formula-1')` — the old expectation encoded the bug).

- [ ] **Step 2: Run the test, verify it FAILS**

```bash
pnpm --filter backend exec jest formula.controller.spec
```

Expected: FAIL — `Expected: "formula-1", "user-1"` / `Received: "user-1", "formula-1"`.

- [ ] **Step 3: Fix the controller**

`formula.controller.ts` last line:

```typescript
    return this.service.getFormulaById(id, user.id);
```

(was `user.id, id`).

- [ ] **Step 4: Run the test, verify it PASSES**

```bash
pnpm --filter backend exec jest formula.controller.spec
```

Expected: PASS.

- [ ] **Step 5: Full backend suite**

```bash
pnpm --filter backend test
```

Expected: PASS (integration tests mock the service and are unaffected).

---

## Task 7: Phase 2 — `FormulaRepository` adopts `BaseRepository`, `mapRow()`, mapped `create` (TDD)

**Files:**
- Test: `apps/backend/src/modules/formula/__tests__/formula.repository.spec.ts` (full rewrite below)
- Modify: `apps/backend/src/modules/formula/repositories/formula.repository.ts` (full rewrite below)

**Interfaces:**
- Consumes: Task 2 `prisma.formula` delegate + generated `Formula` type; `BaseRepository` (`apps/backend/src/shared/baseModule/base.repository.ts`) with `protected getDevAccounts()` and `create(data: Partial<T>): Promise<T>`; Task 1 `CreateFormulaDto`/`FormulaDto`.
- Produces: `FormulaRepository extends BaseRepository<Formula>`; exported types `FormulaWithRelations`, `FormulaRecord` (`Formula & FormulaDto`); `findAll(requesterId) → Promise<FormulaRecord[]>`, `findById(id, requesterId) → Promise<FormulaRecord | null>`, `create(data) → Promise<FormulaRecord>`; `FormulaService` signatures unchanged (FormulaRecord is assignable to FormulaDto).

**Design notes:**
- Return type must be `FormulaRecord = Formula & FormulaDto` so overrides stay assignable to the base signatures (`Promise<T[]>` / `Promise<T | null>` / `Promise<T>`), while `FormulaService` still type-checks against `FormulaDto`.
- `mapRow` strips the 4 relation objects and adds the 4 `productoNNombre` fields.
- Filtering mirrors `BaseRepository`: dev requester → all rows; common → `deletedAt: null AND isActive: true AND id notIn devIds`.
- `pnpm --filter backend exec prisma generate` must have run (Task 2).

- [ ] **Step 1: Write the failing spec (complete file)**

Replace `apps/backend/src/modules/formula/__tests__/formula.repository.spec.ts` with:

```typescript
// src/modules/formula/__tests__/formula.repository.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { FormulaRepository } from '../repositories/formula.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';

describe('FormulaRepository', () => {
  let repository: FormulaRepository;
  let prisma: {
    formula: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    devAccount: {
      findMany: jest.Mock;
    };
  };

  const mockRecordWithRelations = {
    id: 'formula-1',
    producto1Id: 'prod-1',
    producto1: { nombre: 'Turba' },
    porcentaje1: 60,
    producto2Id: 'prod-2',
    producto2: { nombre: 'Perlita' },
    porcentaje2: 40,
    producto3Id: null,
    producto3: null,
    porcentaje3: null,
    producto4Id: null,
    producto4: null,
    porcentaje4: null,
    isActive: true,
    createdAt: new Date('2026-08-01'),
    updatedAt: new Date('2026-08-01'),
    deletedAt: null,
    deletedByUserId: null,
  };

  const expectedDto = {
    id: 'formula-1',
    producto1Id: 'prod-1',
    producto1Nombre: 'Turba',
    porcentaje1: 60,
    producto2Id: 'prod-2',
    producto2Nombre: 'Perlita',
    porcentaje2: 40,
    producto3Id: null,
    producto3Nombre: null,
    porcentaje3: null,
    producto4Id: null,
    producto4Nombre: null,
    porcentaje4: null,
    isActive: true,
    createdAt: new Date('2026-08-01'),
    updatedAt: new Date('2026-08-01'),
    deletedAt: null,
    deletedByUserId: null,
  };

  const productoInclude = {
    producto1: { select: { nombre: true } },
    producto2: { select: { nombre: true } },
    producto3: { select: { nombre: true } },
    producto4: { select: { nombre: true } },
  };

  beforeEach(async () => {
    prisma = {
      formula: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      devAccount: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormulaRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get<FormulaRepository>(FormulaRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('common user: only active, non-deleted, excluding dev accounts', async () => {
      prisma.formula.findMany.mockResolvedValue([mockRecordWithRelations]);

      const result = await repository.findAll('user-1');

      expect(result).toEqual([expectedDto]);
      expect(prisma.formula.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, isActive: true, id: { notIn: [] } },
        include: productoInclude,
      });
    });

    it('common user: excludes dev-account ids from the where clause', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.formula.findMany.mockResolvedValue([]);

      await repository.findAll('user-1');

      expect(prisma.formula.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, isActive: true, id: { notIn: ['dev-1'] } },
        include: productoInclude,
      });
    });

    it('dev user: returns all rows including inactive and soft-deleted', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      const inactive = { ...mockRecordWithRelations, isActive: false };
      const deleted = {
        ...mockRecordWithRelations,
        id: 'formula-2',
        deletedAt: new Date('2026-08-02'),
      };
      prisma.formula.findMany.mockResolvedValue([inactive, deleted]);

      const result = await repository.findAll('dev-1');

      expect(result).toHaveLength(2);
      expect(result[0].isActive).toBe(false);
      expect(result[1].deletedAt).toEqual(new Date('2026-08-02'));
      expect(prisma.formula.findMany).toHaveBeenCalledWith({
        where: {},
        include: productoInclude,
      });
    });

    it('returns empty array when no records exist', async () => {
      prisma.formula.findMany.mockResolvedValue([]);

      const result = await repository.findAll('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('common user: returns mapped DTO when active', async () => {
      prisma.formula.findUnique.mockResolvedValue(mockRecordWithRelations);

      const result = await repository.findById('formula-1', 'user-1');

      expect(result).toEqual(expectedDto);
      expect(prisma.formula.findUnique).toHaveBeenCalledWith({
        where: { id: 'formula-1' },
        include: productoInclude,
      });
    });

    it('common user: returns null for soft-deleted record', async () => {
      prisma.formula.findUnique.mockResolvedValue({
        ...mockRecordWithRelations,
        deletedAt: new Date('2026-08-02'),
      });

      const result = await repository.findById('formula-1', 'user-1');

      expect(result).toBeNull();
    });

    it('common user: returns null for inactive record', async () => {
      prisma.formula.findUnique.mockResolvedValue({
        ...mockRecordWithRelations,
        isActive: false,
      });

      const result = await repository.findById('formula-1', 'user-1');

      expect(result).toBeNull();
    });

    it('dev user: returns soft-deleted record', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.formula.findUnique.mockResolvedValue({
        ...mockRecordWithRelations,
        deletedAt: new Date('2026-08-02'),
      });

      const result = await repository.findById('formula-1', 'dev-1');

      expect(result).not.toBeNull();
      expect(result?.deletedAt).toEqual(new Date('2026-08-02'));
    });

    it('returns null when not found', async () => {
      prisma.formula.findUnique.mockResolvedValue(null);

      const result = await repository.findById('nonexistent', 'user-1');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('re-reads the created row and returns the mapped DTO with producto names', async () => {
      prisma.formula.create.mockResolvedValue({ id: 'formula-1' });
      prisma.formula.findUnique.mockResolvedValue(mockRecordWithRelations);

      const result = await repository.create({
        producto1Id: 'prod-1',
        porcentaje1: 60,
        producto2Id: 'prod-2',
        porcentaje2: 40,
        producto3Id: null,
        porcentaje3: null,
        producto4Id: null,
        porcentaje4: null,
      });

      expect(prisma.formula.create).toHaveBeenCalledWith({
        data: {
          producto1Id: 'prod-1',
          porcentaje1: 60,
          producto2Id: 'prod-2',
          porcentaje2: 40,
          producto3Id: null,
          porcentaje3: null,
          producto4Id: null,
          porcentaje4: null,
        },
      });
      expect(prisma.formula.findUnique).toHaveBeenCalledWith({
        where: { id: 'formula-1' },
        include: productoInclude,
      });
      expect(result).toEqual(expectedDto);
      expect(result).not.toHaveProperty('producto1');
      expect(result.producto1Nombre).toBe('Turba');
      expect(result.producto2Nombre).toBe('Perlita');
      expect(result.producto3Nombre).toBeNull();
      expect(result.producto4Nombre).toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run the spec, verify it FAILS**

```bash
pnpm --filter backend exec jest formula.repository.spec
```

Expected: FAIL — the Phase-1 repository has no dev-account filtering, no `devAccount` handling, and `create` returns the raw row.

- [ ] **Step 3: Write the new repository (complete file)**

Replace `apps/backend/src/modules/formula/repositories/formula.repository.ts` with:

```typescript
// src/modules/formula/repositories/formula.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { BaseRepository } from '../../../shared/baseModule/base.repository';
import { CreateFormulaDto, FormulaDto } from '@vivero/shared';
import { Formula } from '../../../generated/prisma/client';

export type FormulaWithRelations = Formula & {
  producto1: { nombre: string } | null;
  producto2: { nombre: string } | null;
  producto3: { nombre: string } | null;
  producto4: { nombre: string } | null;
};

export type FormulaRecord = Formula & FormulaDto;

const PRODUCTO_INCLUDE = {
  producto1: { select: { nombre: true } },
  producto2: { select: { nombre: true } },
  producto3: { select: { nombre: true } },
  producto4: { select: { nombre: true } },
};

@Injectable()
export class FormulaRepository extends BaseRepository<Formula> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.formula);
  }

  private mapRow(row: FormulaWithRelations): FormulaRecord {
    const { producto1, producto2, producto3, producto4, ...formula } = row;
    return {
      ...formula,
      producto1Nombre: producto1.nombre,
      producto2Nombre: producto2?.nombre ?? null,
      producto3Nombre: producto3?.nombre ?? null,
      producto4Nombre: producto4?.nombre ?? null,
    };
  }

  override async findAll(requesterId: string): Promise<FormulaRecord[]> {
    const devIds = await this.getDevAccounts();
    const isDev = devIds.includes(requesterId);

    const rows: FormulaWithRelations[] = await this.prisma.formula.findMany({
      where: isDev
        ? {}
        : { deletedAt: null, isActive: true, id: { notIn: devIds } },
      include: PRODUCTO_INCLUDE,
    });

    return rows.map((r) => this.mapRow(r));
  }

  override async findById(
    id: string,
    requesterId: string,
  ): Promise<FormulaRecord | null> {
    const devIds = await this.getDevAccounts();
    const isDev = devIds.includes(requesterId);

    const row = (await this.prisma.formula.findUnique({
      where: { id },
      include: PRODUCTO_INCLUDE,
    })) as FormulaWithRelations | null;

    if (!row) return null;
    if (!isDev && (row.deletedAt !== null || !row.isActive)) return null;

    return this.mapRow(row);
  }

  override async create(data: CreateFormulaDto): Promise<FormulaRecord> {
    const created = await this.prisma.formula.create({ data });

    const row = (await this.prisma.formula.findUnique({
      where: { id: created.id },
      include: PRODUCTO_INCLUDE,
    })) as FormulaWithRelations | null;

    if (!row) {
      throw new Error(`Formula ${created.id} not found right after create`);
    }

    return this.mapRow(row);
  }
}
```

**Type note:** if TypeScript flags the override signatures (base is `create(data: Partial<T>): Promise<T>`), leave them — method parameters are bivariant and `FormulaRecord` satisfies the return contract; do not widen public types or add `any`.

- [ ] **Step 4: Run the spec, verify it PASSES**

```bash
pnpm --filter backend exec jest formula.repository.spec
```

Expected: PASS (10 tests: 4 `findAll`, 5 `findById`, 1 `create`).

- [ ] **Step 5: Full formula module + backend suite**

```bash
pnpm --filter backend exec jest formula
pnpm --filter backend test
```

Expected: PASS — service/controller specs mock the repository, and `FormulaRecord` (`Formula & FormulaDto`) is assignable to `FormulaDto`.

---

## Task 8: Phase 2 — validation hardening (shared, TDD)

**Files:**
- Modify: `packages/shared/src/schemas/formula.schema.ts`
- Modify: `packages/shared/src/schemas/__tests__/formula.schema.spec.ts`
- Modify: `packages/shared/src/schemas/productos.schema.ts`
- Modify: `packages/shared/src/schemas/__tests__/productos.schema.spec.ts`

**Interfaces:**
- Consumes: Task 1 `CreateFormulaSchema` (base object: `requiredCuid` + unbounded `z.number()` + sum `.refine`).
- Produces: hardened `CreateFormulaSchema` consumed by both the frontend `zodResolver` and the backend `ZodValidationPipe`; all validation messages use "producto" wording.

**Design notes:**
- zod v3 refine-only errors carry no `path` → cross-field rules use `.superRefine` + `ctx.addIssue({ code: z.ZodIssueCode.custom, message, path })` so RHF `FormMessage` can render them.
- `.int().min(0).max(100)` run at the object level → reported with `path: ['porcentajeN']` automatically.
- The sum `.refine` stays exactly as-is (path-less, form-level).
- Frontend and backend pick this up automatically (both import the shared schema); integration invalid-payload tests assert only `400` → unaffected.

- [ ] **Step 1: Add the failing spec cases (write the tests first)**

Append the following cases inside `describe("CreateFormulaSchema")` in `formula.schema.spec.ts`:

```typescript
  it("rejects negative porcentaje1", () => {
    const result = CreateFormulaSchema.safeParse({
      producto1Id: "clx1234567890abcdef123467",
      porcentaje1: -5,
      producto2Id: null,
      porcentaje2: null,
      producto3Id: null,
      porcentaje3: null,
      producto4Id: null,
      porcentaje4: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("porcentaje1"))).toBe(true);
    }
  });

  it("rejects non-integer porcentaje1", () => {
    const result = CreateFormulaSchema.safeParse({
      producto1Id: "clx1234567890abcdef123467",
      porcentaje1: 33.3,
      producto2Id: null,
      porcentaje2: null,
      producto3Id: null,
      porcentaje3: null,
      producto4Id: null,
      porcentaje4: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("porcentaje1"))).toBe(true);
    }
  });

  it("rejects a slot with a product but no percentage", () => {
    const result = CreateFormulaSchema.safeParse({
      producto1Id: "clx1234567890abcdef123467",
      porcentaje1: 100,
      producto2Id: "clx1234567890abcdef123478",
      porcentaje2: null,
      producto3Id: null,
      porcentaje3: null,
      producto4Id: null,
      porcentaje4: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.message === "Cada producto debe tener su porcentaje",
      );
      expect(issue?.path).toEqual(["porcentaje2"]);
    }
  });

  it("rejects a slot with a percentage but no product", () => {
    const result = CreateFormulaSchema.safeParse({
      producto1Id: "clx1234567890abcdef123467",
      porcentaje1: 70,
      producto2Id: null,
      porcentaje2: 30,
      producto3Id: null,
      porcentaje3: null,
      producto4Id: null,
      porcentaje4: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.message === "Cada producto debe tener su porcentaje",
      );
      expect(issue?.path).toEqual(["producto2Id"]);
    }
  });

  it("rejects the same product in two slots", () => {
    const result = CreateFormulaSchema.safeParse({
      producto1Id: "clx1234567890abcdef123467",
      porcentaje1: 60,
      producto2Id: "clx1234567890abcdef123467",
      porcentaje2: 40,
      producto3Id: null,
      porcentaje3: null,
      producto4Id: null,
      porcentaje4: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.message === "No se puede repetir el mismo producto",
      );
      expect(issue?.path).toEqual(["producto2Id"]);
    }
  });
```

(The existing "sustrato 1" message assertions still pass at this point — messages are flipped in Step 4.)

- [ ] **Step 2: Run the spec, verify the new cases FAIL**

```bash
pnpm --filter @vivero/shared exec jest formula.schema
```

Expected: FAIL — the current schema accepts negative/non-integer percentages, unpaired slots, and duplicates.

- [ ] **Step 3: Rewrite `CreateFormulaSchema` (complete replacement)**

In `formula.schema.ts`, replace the whole `CreateFormulaSchema` block (object + `.refine`) with:

```typescript
export const CreateFormulaSchema = z
  .object({
    producto1Id: requiredCuid("El producto 1"),
    porcentaje1: z
      .number({ required_error: "El porcentaje 1 es requerido" })
      .int()
      .min(0)
      .max(100),
    producto2Id: requiredCuid("El producto 2").nullable(),
    porcentaje2: z.number().int().min(0).max(100).nullable(),
    producto3Id: requiredCuid("El producto 3").nullable(),
    porcentaje3: z.number().int().min(0).max(100).nullable(),
    producto4Id: requiredCuid("El producto 4").nullable(),
    porcentaje4: z.number().int().min(0).max(100).nullable(),
  })
  .superRefine((data, ctx) => {
    // Pair integrity: a filled slot needs its percentage and vice versa
    for (const n of [2, 3, 4] as const) {
      const id = data[`producto${n}Id`];
      const pct = data[`porcentaje${n}`];
      if ((id === null) !== (pct === null)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cada producto debe tener su porcentaje",
          path: [id === null ? `producto${n}Id` : `porcentaje${n}`],
        });
      }
    }

    // Distinct slots: no product may appear twice
    const seen = new Set<string>();
    for (const n of [1, 2, 3, 4] as const) {
      const id = data[`producto${n}Id`];
      if (id === null) continue;
      if (seen.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "No se puede repetir el mismo producto",
          path: [`producto${n}Id`],
        });
      }
      seen.add(id);
    }
  })
  .refine(
    (data) => {
      const total =
        data.porcentaje1 +
        (data.porcentaje2 ?? 0) +
        (data.porcentaje3 ?? 0) +
        (data.porcentaje4 ?? 0);
      return total === 100;
    },
    { message: "Los porcentajes deben sumar 100%" },
  );
```

`export type CreateFormulaDto = z.infer<typeof CreateFormulaSchema>;` below it stays unchanged.

- [ ] **Step 4: Flip "sustrato" → "producto" messages (schemas + spec assertions together)**

`formula.schema.ts` — `FormulaSchema` field messages only (CreateFormulaSchema is already producto-worded from Step 3):

| Before | After |
|---|---|
| `producto1Id: requiredCuid("El sustrato 1"),` | `producto1Id: requiredCuid("El producto 1"),` |
| `producto2Id: requiredCuid("El sustrato 2").nullable(),` | `producto2Id: requiredCuid("El producto 2").nullable(),` |
| `producto3Id: requiredCuid("El sustrato 3").nullable(),` | `producto3Id: requiredCuid("El producto 3").nullable(),` |
| `producto4Id: requiredCuid("El sustrato 4").nullable(),` | `producto4Id: requiredCuid("El producto 4").nullable(),` |

`productos.schema.ts`:

| Before | After |
|---|---|
| `id: requiredCuid("El sustrato"),` | `id: requiredCuid("El producto"),` |
| `min(1, { message: "El nombre del sustrato es requerido" })` (Create) | `min(1, { message: "El nombre del producto es requerido" })` |
| `min(1, { message: "El nombre del sustrato es requerido" }).optional()` (Update) | `min(1, { message: "El nombre del producto es requerido" }).optional()` |

`formula.schema.spec.ts` — both occurrences:

```typescript
expect(messages.some((m) => m.includes("producto 1"))).toBe(true);
```

(was `includes("sustrato 1")` — one in `describe("FormulaSchema")`, one in `describe("CreateFormulaSchema")`).

`productos.schema.spec.ts` — three occurrences:

```typescript
expect(messages.some((m) => m.includes("producto"))).toBe(true);   // was "sustrato"
expect(messages).toContain("El nombre del producto es requerido");  // ×2, was "...del sustrato..."
```

- [ ] **Step 5: Run shared tests, verify PASS**

```bash
pnpm --filter @vivero/shared build && pnpm --filter @vivero/shared test
```

Expected: PASS — all new validation cases green, flipped message assertions green.

- [ ] **Step 6: Full gates (consumers of the shared schema)**

```bash
pnpm lint && pnpm type-check && pnpm test
pnpm --filter backend test:integration
```

Expected: PASS — frontend resolver and backend pipe pick up the schema automatically; no consumer test asserts the old message substrings (verified during research).

- [ ] **Step 7: Verify the sustrato allowlist shrank**

```bash
rg -i 'sustrato' apps packages --glob '!**/node_modules/**' -l
```

Expected: same as Task 5 allowlist **minus** `formula.schema.ts`, `productos.schema.ts` and their specs.

---

## Task 9: Final audits, SQL handoff, manual smoke

- [ ] **Step 1: Final boundary audits**

```bash
rg -i 'mezcla' apps packages --glob '!**/prisma/migrations/**' --glob '!**/node_modules/**'
rg -i 'sustrato' apps packages --glob '!**/node_modules/**' -l
```

Expected: first command **empty**; second only the Task 5 allowlist minus `formula.schema.ts`/`productos.schema.ts` + specs (legacy, siembraPartida fields, aSembrar, prensadoSustrato, SustratoSearch, permissions mock value, docs). Any other hit = fix before handoff.

- [ ] **Step 2: Final full gates**

```bash
pnpm lint && pnpm type-check && pnpm test
pnpm --filter backend test:integration
```

Expected: everything PASS.

- [ ] **Step 3: Hand the SQL to the user (nothing applied by tooling — user runs manually)**

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

Handoff notes to include:
- SQL and code must land together: nav/guards 403 until the `entities` UPDATE runs; open sessions hold the old permission map until re-login.
- MySQL/MariaDB updates FK definitions automatically; FK constraint *names* (e.g. `SiembraPartidas_mezclaId_fkey`) stay stale — cosmetic only.
- The generic record (`'Sustrato Genérico'`, cuids `c00000000000000000000001`/`c00000000000000000000002`) is data — untouched, so `getOrCreateGenericFormula` keeps finding it; the producto selector still shows "Sustrato Genérico" until a separate data decision.
- Optional `prisma migrate` history consistency: wrap the SQL in a migration folder + `prisma migrate resolve --applied <name>`; otherwise plain manual SQL (prensadoSustrato precedent).

- [ ] **Step 4: Manual smoke checklist (after the user runs the SQL)**

- `/formulas` list, create, and view slideover
- Formula selector inside programación de siembra (incl. generic formula option)
- `/productos` page list/create/edit
- Permissions admin shows "Fórmulas"/"Productos" entities
- Programación de siembra create flow end-to-end (guard still `programacion_siembra:create`)

**Done when:** audits clean, all gates PASS, SQL handed off, smoke checklist confirmed. No commits — the user commits manually.
