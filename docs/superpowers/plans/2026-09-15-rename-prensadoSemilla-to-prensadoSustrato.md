# Rename prensadoSemilla → prensadoSustrato Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename `prensadoSemilla` to `prensadoSustrato` across the entire stack.

**Architecture:** Systematic field rename across three layers (shared → backend → frontend). No file renames — only content edits.

**Tech Stack:** Prisma, Zod, NestJS, Next.js, TypeScript

## Global Constraints

- No database migrations — user handles manually
- No git commits — user handles manually
- Field label stays "Prensado" (unchanged)
- Migration SQL files untouched (historical)
- Label lookup keys (`CreateSiembraPartida`, etc.) unchanged

---

## Task 1: Shared Package — Rename Schema and Labels

**Files:**
- Modify: `packages/shared/src/schemas/siembraPartida.schema.ts`
- Modify: `packages/shared/src/schemas/field-labels.ts`
- Modify: `packages/shared/src/schemas/__tests__/siembraPartida.schema.spec.ts`
- Modify: `packages/shared/src/schemas/__tests__/field-labels.spec.ts`

**Steps:**

- [ ] **Step 1: Update siembraPartida.schema.ts**

In `packages/shared/src/schemas/siembraPartida.schema.ts`:

```typescript
// Line 20: rename constant
export const PrensadoSustratoValues = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6] as const;

// Lines 25-31: rename field in SiembraPartidaSchema
prensadoSustrato: z
  .number({ message: "El prensado de semilla es requerido" })
  .min(0, { message: "El prensado de semilla debe ser mayor o igual a 0" })
  .max(6, { message: "El prensado de semilla debe ser menor o igual a 6" })
  .refine((v) => PrensadoSustratoValues.includes(v as any), {
    message: "El prensado de semilla debe ser un múltiplo de 0.5 (0, 0.5, 1, ... 6)",
  }),

// Lines 85-91: rename field in CreateSiembraPartidaSchema
prensadoSustrato: z
  .number({ message: "El prensado de semilla es requerido" })
  .min(0, { message: "El prensado de semilla debe ser mayor o igual a 0" })
  .max(6, { message: "El prensado de semilla debe ser menor o igual a 6" })
  .refine((v) => PrensadoSustratoValues.includes(v as any), {
    message: "El prensado de semilla debe ser un múltiplo de 0.5 (0, 0.5, 1, ... 6)",
  }),
```

- [ ] **Step 2: Update field-labels.ts**

In `packages/shared/src/schemas/field-labels.ts`, change `prensadoSemilla` → `prensadoSustrato` in 4 places:
- Line 79: `CreateSiembraPartida` map
- Line 100: `AsignarUbiSiembraCompleta` map
- Line 122: `SiembraPartida` map
- Line 219: `ASembrar` map

All keep label `"Prensado"`.

- [ ] **Step 3: Update siembraPartida.schema.spec.ts**

In `packages/shared/src/schemas/__tests__/siembraPartida.schema.spec.ts`, replace all `prensadoSemilla` → `prensadoSustrato` (approximately 15 occurrences in test data, assertions, and test descriptions).

- [ ] **Step 4: Update field-labels.spec.ts**

In `packages/shared/src/schemas/__tests__/field-labels.spec.ts`, replace `"prensadoSemilla"` → `"prensadoSustrato"` in expected keys arrays.

- [ ] **Step 5: Verify shared package builds**

```bash
pnpm --filter @vivero/shared build
```

---

## Task 2: Prisma Schema

**Files:**
- Modify: `apps/backend/prisma/schema/siembraPartidas.prisma`

**Steps:**

- [ ] **Step 1: Rename field in Prisma schema**

In `apps/backend/prisma/schema/siembraPartidas.prisma`, line 8:

```prisma
// Before:
prensadoSemilla    Decimal  @db.Decimal(3,1) @default(0)
// After:
prensadoSustrato    Decimal  @db.Decimal(3,1) @default(0)
```

- [ ] **Step 2: Generate Prisma client**

```bash
pnpm --filter backend exec prisma generate
```

Note: Do NOT run `prisma migrate` — user handles migration manually.

---

## Task 3: Backend — Update Service and Tests

**Files:**
- Modify: `apps/backend/src/modules/siembraPartidas/siembraPartidas.service.ts` (4 references)
- Modify: `apps/backend/src/modules/legacy/partidas/partidas.service.ts` (1 reference)
- Modify: `apps/backend/src/modules/siembraPartidas/__tests__/siembraPartidas.service.spec.ts` (6 references)
- Modify: `apps/backend/src/modules/siembraPartidas/__tests__/siembraPartidas.controller.spec.ts` (1 reference)
- Modify: `apps/backend/test/integration/programacionSiembra.integration.spec.ts` (1 reference)

**Steps:**

- [ ] **Step 1: Update siembraPartidas.service.ts**

Replace all `prensadoSemilla` → `prensadoSustrato`:
- Line 161: `row.prensadoSemilla.toNumber()` → `row.prensadoSustrato.toNumber()`
- Line 267: `data.prensadoSemilla` → `data.prensadoSustrato`
- Line 319: `prensadoSemilla: 0` → `prensadoSustrato: 0`
- Line 385: `data.prensadoSemilla` → `data.prensadoSustrato`

- [ ] **Step 2: Update partidas.service.ts**

Line 94: `data.prensadoSemilla` → `data.prensadoSustrato`

- [ ] **Step 3: Update backend test files**

Replace all `prensadoSemilla` → `prensadoSustrato` in:
- `siembraPartidas.service.spec.ts`
- `siembraPartidas.controller.spec.ts`
- `programacionSiembra.integration.spec.ts`

- [ ] **Step 4: Verify backend compiles**

```bash
pnpm --filter backend type-check
```

---

## Task 4: Frontend — Update Components and Tests

**Files:**
- Modify: `apps/frontend/src/features/aSembrar/components/a-sembrar-edit-form.tsx`
- Modify: `apps/frontend/src/features/aSembrar/components/a-sembrar-data-table.tsx`
- Modify: `apps/frontend/src/features/siembraPartidas/components/siembra-partidas-registradas-view-form.tsx`
- Modify: 3 test files

**Steps:**

- [ ] **Step 1: Update a-sembrar-edit-form.tsx**

- Import: `PrensadoSemillaValues` → `PrensadoSustratoValues`
- Line 215: `name="prensadoSemilla"` → `name="prensadoSustrato"`
- Line 236: `PrensadoSemillaValues.map(...)` → `PrensadoSustratoValues.map(...)`

- [ ] **Step 2: Update a-sembrar-data-table.tsx**

- Line 57: `prensadoSemilla: row.prensadoSemilla` → `prensadoSustrato: row.prensadoSustrato`
- Line 113: `"prensadoSemilla"` → `"prensadoSustrato"` in summaryFields

- [ ] **Step 3: Update siembra-partidas-registradas-view-form.tsx**

- Line 172: `selectedPartida.prensadoSemilla` → `selectedPartida.prensadoSustrato`

- [ ] **Step 4: Update frontend test files**

Replace `prensadoSemilla` → `prensadoSustrato` in mock data across:
- `siembra-partidas-registradas-view-form.test.tsx`
- `siembra-partidas-registradas-data-table.test.tsx`
- `a-sembrar-data-table.test.tsx`

- [ ] **Step 5: Verify frontend compiles**

```bash
pnpm --filter frontend type-check
```

---

## Task 5: Verification

**Steps:**

- [ ] **Step 1: Run type check**

```bash
pnpm type-check
```

Expected: No type errors.

- [ ] **Step 2: Run lint**

```bash
pnpm lint
```

Expected: No new errors.

- [ ] **Step 3: Run tests**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 4: Grep for stale references**

```bash
rg "prensadoSemilla" --type ts
```

Expected: No matches in source code (only in migration SQL files and historical docs).
