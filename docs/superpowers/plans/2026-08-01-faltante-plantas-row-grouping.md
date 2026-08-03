# FaltantePlantas Row Grouping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Group FaltantePlantas rows by `partidaId` on the frontend, summing `porPr` across sub-indices and showing a `+N` badge.

**Architecture:** Frontend-only approach. A new utility function groups raw API data via `useMemo` in the dashboard. The `partidaId` column shows a badge indicating how many sub-indices were collapsed.

**Tech Stack:** TypeScript, React, Zod, TanStack Table, Jest

## Global Constraints

- Conventional Commits enforced (`<type>(<scope>): <subject>`)
- "use client" on all provider and component files
- Spanish-only UI strings
- OKLCH tokens only, no new palettes
- Follow existing patterns: shadcn/ui, existing test patterns
- All shared schemas in `packages/shared/src/schemas/`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `packages/shared/src/schemas/alerts.schema.ts` | Modify | Add `subRowCount` optional field to `FaltantePlantasDtoSchema` |
| `apps/frontend/src/features/alerts/utils/group-faltante-plantas.ts` | Create | `groupFaltantePlantas()` utility function |
| `apps/frontend/src/features/alerts/utils/__tests__/group-faltante-plantas.test.ts` | Create | Unit tests for grouping logic |
| `apps/frontend/src/features/alerts/components/v1/AlertsDashboardV1.tsx` | Modify | Apply grouping via `useMemo` |
| `apps/frontend/src/features/alerts/components/shared/alert-columns.tsx` | Modify | Show `+N` badge in `partidaId` column, remove comment block |

---

### Task 1: Add `subRowCount` to shared schema

**Files:**
- Modify: `packages/shared/src/schemas/alerts.schema.ts:57-68`

**Interfaces:**
- Produces: `subRowCount?: number` on `FaltantePlantasDtoSchema`

- [ ] **Step 1: Add optional field to schema**

```typescript
export const FaltantePlantasDtoSchema = AlertBaseDtoSchema.extend({
  hai: z.string(),

  nrocont: z.string(),
  solicito: z.number(),
  fPrimer: z.string(),
  pr: z.string(),
  stIniPr: z.string(),
  porPr: z.number(),
  subRowCount: z.number().optional(),
});
```

- [ ] **Step 2: Run shared package tests**

Run: `pnpm --filter @vivero/shared test`
Expected: PASS

- [ ] **Step 3: Build shared package**

Run: `pnpm --filter @vivero/shared build`
Expected: PASS (type exported correctly)

- [ ] **Step 4: Commit**

```bash
git add packages/shared/src/schemas/alerts.schema.ts
git commit -m "feat(shared): add optional subRowCount to FaltantePlantasDto"
```

---

### Task 2: Create grouping utility with tests

**Files:**
- Create: `apps/frontend/src/features/alerts/utils/group-faltante-plantas.ts`
- Create: `apps/frontend/src/features/alerts/utils/__tests__/group-faltante-plantas.test.ts`

**Interfaces:**
- Consumes: `FaltantePlantasDto` from `@vivero/shared`
- Produces: `groupFaltantePlantas(data: FaltantePlantasDto[]): FaltantePlantasDto[]`

- [ ] **Step 1: Write the failing test**

```typescript
// apps/frontend/src/features/alerts/utils/__tests__/group-faltante-plantas.test.ts
import { groupFaltantePlantas } from "../group-faltante-plantas";
import type { FaltantePlantasDto } from "@vivero/shared";

const makeRow = (
  partidaId: number,
  indice: number,
  porPr: number,
  solicito: number = 1000,
): FaltantePlantasDto => ({
  partidaId,
  anio: 2026,
  indice,
  codigoEspecie: "ESP001",
  nombreEspecie: "Especie Test",
  commentCount: 0,
  hai: "B",
  nrocont: "1",
  solicito,
  fPrimer: "2026-01-01",
  pr: "85",
  stIniPr: "1",
  porPr,
});

describe("groupFaltantePlantas", () => {
  it("returns single row unchanged", () => {
    const data = [makeRow(1, 0, 500)];
    const result = groupFaltantePlantas(data);
    expect(result).toHaveLength(1);
    expect(result[0].partidaId).toBe(1);
    expect(result[0].porPr).toBe(500);
    expect(result[0].subRowCount).toBeUndefined();
  });

  it("groups rows with same partidaId and different indice", () => {
    const data = [
      makeRow(1, 0, 300, 1000),
      makeRow(1, 1, 200, 1000),
      makeRow(1, 2, 150, 1000),
    ];
    const result = groupFaltantePlantas(data);
    expect(result).toHaveLength(1);
    expect(result[0].partidaId).toBe(1);
    expect(result[0].indice).toBe(0);
    expect(result[0].porPr).toBe(650); // 300 + 200 + 150
    expect(result[0].solicito).toBe(1000); // first row's value
    expect(result[0].subRowCount).toBe(2);
  });

  it("handles multiple groups independently", () => {
    const data = [
      makeRow(1, 0, 300),
      makeRow(1, 1, 200),
      makeRow(2, 0, 400),
      makeRow(3, 0, 100),
      makeRow(3, 1, 50),
    ];
    const result = groupFaltantePlantas(data);
    expect(result).toHaveLength(3);
    expect(result.find((r) => r.partidaId === 1)?.porPr).toBe(500);
    expect(result.find((r) => r.partidaId === 1)?.subRowCount).toBe(1);
    expect(result.find((r) => r.partidaId === 2)?.porPr).toBe(400);
    expect(result.find((r) => r.partidaId === 2)?.subRowCount).toBeUndefined();
    expect(result.find((r) => r.partidaId === 3)?.porPr).toBe(150);
    expect(result.find((r) => r.partidaId === 3)?.subRowCount).toBe(1);
  });

  it("returns empty array for empty input", () => {
    expect(groupFaltantePlantas([])).toHaveLength(0);
  });

  it("preserves all fields from first row", () => {
    const data = [
      makeRow(1, 0, 300),
      makeRow(1, 1, 200),
    ];
    const result = groupFaltantePlantas(data);
    expect(result[0].hai).toBe("B");
    expect(result[0].nrocont).toBe("1");
    expect(result[0].pr).toBe("85");
    expect(result[0].stIniPr).toBe("1");
    expect(result[0].fPrimer).toBe("2026-01-01");
    expect(result[0].codigoEspecie).toBe("ESP001");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter frontend test -- --testPathPattern="group-faltante-plantas"`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write the implementation**

```typescript
// apps/frontend/src/features/alerts/utils/group-faltante-plantas.ts
import type { FaltantePlantasDto } from "@vivero/shared";

export function groupFaltantePlantas(
  data: FaltantePlantasDto[],
): FaltantePlantasDto[] {
  const grouped = new Map<number, FaltantePlantasDto[]>();

  for (const row of data) {
    const existing = grouped.get(row.partidaId);
    if (existing) {
      existing.push(row);
    } else {
      grouped.set(row.partidaId, [row]);
    }
  }

  const result: FaltantePlantasDto[] = [];
  for (const rows of grouped.values()) {
    if (rows.length === 1) {
      result.push(rows[0]);
    } else {
      const first = { ...rows[0] };
      first.porPr = rows.reduce((sum, r) => sum + Number(r.porPr ?? 0), 0);
      first.subRowCount = rows.length - 1;
      result.push(first);
    }
  }

  return result;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter frontend test -- --testPathPattern="group-faltante-plantas"`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/alerts/utils/group-faltante-plantas.ts apps/frontend/src/features/alerts/utils/__tests__/group-faltante-plantas.test.ts
git commit -m "feat(alerts): add groupFaltantePlantas utility with tests"
```

---

### Task 3: Apply grouping in dashboard

**Files:**
- Modify: `apps/frontend/src/features/alerts/components/v1/AlertsDashboardV1.tsx:1-28,60-70`

**Interfaces:**
- Consumes: `groupFaltantePlantas` from Task 2
- Produces: grouped data passed to `AlertSection`

- [ ] **Step 1: Add useMemo import and grouping logic**

Add `useMemo` to the existing `import { Suspense } from "react"` line:

```typescript
import { Suspense, useMemo } from "react";
```

Add import for the utility:

```typescript
import { groupFaltantePlantas } from "../../utils/group-faltante-plantas";
```

- [ ] **Step 2: Apply grouping in AlertsContent**

In the `AlertsContent` function, after the data fetches, add:

```typescript
const faltantePlantasGrouped = useMemo(
  () => groupFaltantePlantas(faltantePlantas),
  [faltantePlantas],
);
```

Update the `totalAlerts` calculation to use the grouped count:

```typescript
const totalAlerts =
  siembraRetrasada.length +
  faltaGerminacion.length +
  faltantePlantasGrouped.length +
  faltaPreExpedicion.length;
```

Update the `AlertSummaryCards` to use grouped count:

```typescript
<AlertSummaryCards
  siembraRetrasadaCount={siembraRetrasada.length}
  faltaGerminacionCount={faltaGerminacion.length}
  faltantePlantasCount={faltantePlantasGrouped.length}
  faltaPreExpedicionCount={faltaPreExpedicion.length}
/>
```

Update the FaltantePlantas `AlertSection`:

```typescript
{faltantePlantasGrouped.length > 0 && (
  <AlertSection
    title="Faltante Estimado de Plantas"
    description="Partidas donde plantas germinadas son menor a las solicitadas"
    count={faltantePlantasGrouped.length}
    alertType="faltante-plantas"
    columns={faltantePlantasColumns}
    data={faltantePlantasGrouped}
    exportColumns={faltantePlantasExportColumns}
  />
)}
```

Update the separator condition:

```typescript
{faltaGerminacion.length > 0 && faltantePlantasGrouped.length > 0 && (
  <Separator />
)}
```

And:

```typescript
{faltantePlantasGrouped.length > 0 && faltaPreExpedicion.length > 0 && (
  <Separator />
)}
```

- [ ] **Step 3: Run all frontend tests**

Run: `pnpm --filter frontend test`
Expected: PASS (104+ tests)

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/features/alerts/components/v1/AlertsDashboardV1.tsx
git commit -m "feat(alerts): apply row grouping to FaltantePlantas dashboard"
```

---

### Task 4: Add badge to `partidaId` column and clean up comments

**Files:**
- Modify: `apps/frontend/src/features/alerts/components/shared/alert-columns.tsx:240-265`

**Interfaces:**
- Consumes: `subRowCount` from grouped DTO (Task 1)
- Produces: visual badge in `partidaId` cell

- [ ] **Step 1: Add Badge import**

Add to the existing imports at the top of the file:

```typescript
import { Badge } from "@/components/ui/badge";
```

- [ ] **Step 2: Update the `partidaId` cell in `faltantePlantasColumns`**

Replace the cell renderer for `partidaId` (lines 258-262):

```tsx
cell: ({ row }) => (
  <div className="font-black text-sm text-foreground/80 tracking-tight">
    #{row.original.partidaId}
    {row.original.indice !== 0 && `/ ${row.original.indice}`}
    {row.original.subRowCount && row.original.subRowCount > 0 && (
      <Badge variant="secondary" className="ml-1 text-[9px]">
        +{row.original.subRowCount}
      </Badge>
    )}
  </div>
),
```

- [ ] **Step 3: Remove the comment block**

Remove lines 243-250 (the `// ok here the client ask...` comment block).

- [ ] **Step 4: Increase column size for badge space**

Change `size: 70` to `size: 90` for the `partidaId` column to accommodate the badge.

- [ ] **Step 5: Run all frontend tests**

Run: `pnpm --filter frontend test`
Expected: PASS

- [ ] **Step 6: Run lint**

Run: `pnpm --filter frontend lint`
Expected: 0 errors

- [ ] **Step 7: Commit**

```bash
git add apps/frontend/src/features/alerts/components/shared/alert-columns.tsx
git commit -m "feat(alerts): add +N badge to FaltantePlantas grouped rows"
```

---

### Task 5: Final verification

- [ ] **Step 1: Run full test suite**

Run: `pnpm test`
Expected: All tests pass

- [ ] **Step 2: Run lint and type check**

Run: `pnpm lint`
Expected: 0 errors

- [ ] **Step 3: Visual verification**

Start dev server and verify:
- FaltantePlantas section shows grouped rows
- `+N` badge appears on grouped rows
- Diferencia recalculates with summed `porPr`
- Exports reflect grouped data

- [ ] **Step 4: Final commit if any fixes needed**
