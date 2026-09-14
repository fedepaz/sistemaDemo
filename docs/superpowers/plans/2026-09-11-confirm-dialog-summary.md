# Confirmation Dialog Form Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add explicit form data summary to SlideOverForm AlertDialog so users see exactly what they're submitting before confirming.

**Architecture:** Extend `ConfirmConfig` with required `summaryFields: string[]`. SlideOverForm reads `form.getValues()`, maps each listed field to its label from `fieldLabels`, auto-formats values (dates, booleans, nulls), and renders a summary table in the AlertDialog between description and footer.

**Tech Stack:** React, react-hook-form, existing `formatShortDate` from `@/lib/date-utils`, existing `fieldLabels` from `@vivero/shared`.

## Global Constraints

- `summaryFields` is required on `ConfirmConfig` (not optional) — enforced at compile time
- Empty array `[]` = no summary rendered (siembra authorizer)
- Labels resolved from `fieldLabels[field]` prop, fallback to camelCase → Title Case
- Formatting rules auto-applied by SlideOverForm — consumers don't format values
- No new dependencies — uses existing `formatShortDate`, `fieldLabels`, form state

---

## File Structure

| File | Change |
|------|--------|
| `apps/frontend/src/components/data-display/data-table/slide-over-form.tsx` | Add `summaryFields` to `ConfirmConfig`, add `formatSummaryValue` helper, render summary in AlertDialog |
| `apps/frontend/src/features/users/components/user-data-table.tsx` | Add `summaryFields: ["firstName", "lastName", "email"]` |
| `apps/frontend/src/features/entities/components/entity-data-table.tsx` | Add `summaryFields: ["name", "label", "permissionType"]` |
| `apps/frontend/src/features/extendidos/components/extendido-data-table.tsx` | Add `summaryFields: ["ubicacion", "baja", "extendido"]` |
| `apps/frontend/src/features/aSembrar/components/a-sembrar-data-table.tsx` | Add `summaryFields: ["cg", "f_siembra", "cantidaNroCont", "cantidadGrs", "ajuste", "prensadoSemilla", "profundidadSemilla", "tratamientoSemilla", "metodoMaquina", "detalleExtendido"]` |
| `apps/frontend/src/features/siembra/components/siembra-data-table.tsx` | Add `summaryFields: ["partidaId", "anio", "indice"]` |
| `apps/frontend/src/features/alerts/components/v1/alerts-data-table.tsx` | Add `summaryFields: ["content"]` |

---

### Task 1: Update ConfirmConfig type and add formatting helper

**Files:**
- Modify: `apps/frontend/src/components/data-display/data-table/slide-over-form.tsx:31-35`

**Interfaces:**
- Produces: `ConfirmConfig.summaryFields: string[]` (required), `formatSummaryValue(value: unknown): string`

- [ ] **Step 1: Add `summaryFields` to `ConfirmConfig`**

```ts
// slide-over-form.tsx line 31-35
export type ConfirmConfig = {
  title: string;
  description: string;
  label?: string;
  summaryFields: string[];  // required — [] means no summary
};
```

- [ ] **Step 2: Add `formatSummaryValue` helper inside `SlideOverForm` component**

Add after `getFieldLabel` (line 103), before `submitForm`:

```ts
const formatSummaryValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Si" : "No";
  if (value instanceof Date) return formatShortDate(value);
  if (typeof value === "number") return value.toLocaleString("es-AR");
  if (typeof value === "string") {
    // Check if it's an ISO date string
    if (value.match(/^\d{4}-\d{2}-\d{2}(T|$)/)) return formatShortDate(value);
    return value;
  }
  return String(value);
};
```

- [ ] **Step 3: Add import for `formatShortDate`**

```ts
// slide-over-form.tsx — add to imports at top
import { formatShortDate } from "@/lib/date-utils";
```

- [ ] **Step 4: Run lint to verify no errors**

Run: `pnpm --filter frontend lint`
Expected: PASS (0 errors)

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/components/data-display/data-table/slide-over-form.tsx
git commit -m "feat(slide-over-form): add summaryFields to ConfirmConfig and formatSummaryValue helper"
```

---

### Task 2: Render summary in AlertDialog

**Files:**
- Modify: `apps/frontend/src/components/data-display/data-table/slide-over-form.tsx:249-252`

**Interfaces:**
- Consumes: `confirm.summaryFields`, `form.getValues()`, `fieldLabels`, `formatSummaryValue`

- [ ] **Step 1: Add summary rendering between description and footer**

Replace the `AlertDialogDescription` section (lines 249-251) with:

```tsx
<AlertDialogDescription className="text-base pt-2">
  {confirm.description}
</AlertDialogDescription>
{confirm.summaryFields.length > 0 && (
  <div className="mt-4 rounded-lg border bg-muted/50 p-3">
    <p className="text-xs font-medium text-muted-foreground mb-2">Resumen:</p>
    <dl className="space-y-1">
      {confirm.summaryFields.map((field) => {
        const values = form?.getValues() ?? {};
        const value = values[field];
        return (
          <div key={field} className="flex justify-between text-sm">
            <dt className="text-muted-foreground">{getFieldLabel(field)}</dt>
            <dd className="font-medium text-right">{formatSummaryValue(value)}</dd>
          </div>
        );
      })}
    </dl>
  </div>
)}
```

- [ ] **Step 2: Run lint to verify no errors**

Run: `pnpm --filter frontend lint`
Expected: PASS (0 errors)

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/data-display/data-table/slide-over-form.tsx
git commit -m "feat(slide-over-form): render form summary in confirmation dialog"
```

---

### Task 3: Add summaryFields to all consumers

**Files:**
- Modify: `apps/frontend/src/features/users/components/user-data-table.tsx`
- Modify: `apps/frontend/src/features/entities/components/entity-data-table.tsx`
- Modify: `apps/frontend/src/features/extendidos/components/extendido-data-table.tsx`
- Modify: `apps/frontend/src/features/aSembrar/components/a-sembrar-data-table.tsx`
- Modify: `apps/frontend/src/features/siembra/components/siembra-data-table.tsx`
- Modify: `apps/frontend/src/features/alerts/components/v1/alerts-data-table.tsx`

**Interfaces:**
- Consumes: `ConfirmConfig.summaryFields` (required string array)

- [ ] **Step 1: Add `summaryFields` to users `confirm`**

In `user-data-table.tsx`, find the `confirm` prop and add `summaryFields`:

```tsx
confirm={{
  title: "Actualizar usuario",
  description: `¿Deseas guardar los cambios en ${selectedUser.username}?`,
  label: "Actualizar",
  summaryFields: ["firstName", "lastName", "email"],
}}
```

- [ ] **Step 2: Add `summaryFields` to entities `confirm`**

In `entity-data-table.tsx`:

```tsx
confirm={{
  title: "Crear entidad",
  description: "¿Deseas crear esta nueva entidad?",
  label: "Crear",
  summaryFields: ["name", "label", "permissionType"],
}}
```

- [ ] **Step 3: Add `summaryFields` to extendidos `confirm`**

In `extendido-data-table.tsx`:

```tsx
confirm={{
  title: "Confirmar extendido",
  description: "¿Deseas confirmar la asignación de ubicación para este extendido?",
  label: "Confirmar Extendido",
  summaryFields: ["ubicacion", "baja", "extendido"],
}}
```

- [ ] **Step 4: Add `summaryFields` to aSembrar `confirm`**

In `a-sembrar-data-table.tsx`:

```tsx
confirm={{
  title: "Confirmar siembra",
  description: "¿Deseas confirmar siembra?",
  label: "Completar Siembra",
  summaryFields: ["cg", "f_siembra", "cantidaNroCont", "cantidadGrs", "ajuste", "prensadoSemilla", "profundidadSemilla", "tratamientoSemilla", "metodoMaquina", "detalleExtendido"],
}}
```

- [ ] **Step 5: Add `summaryFields` to siembra `confirm`**

In `siembra-data-table.tsx`:

```tsx
confirm={{
  title: "Autorizar siembra",
  description: "¿Deseas autorizar esta partida para siembra?",
  label: "Autorizar Siembra",
  summaryFields: ["partidaId", "anio", "indice"],
}}
```

- [ ] **Step 6: Add `summaryFields` to alerts `confirm`**

In `alerts-data-table.tsx`:

```tsx
confirm={{
  title: "Agregar comentario",
  description: "¿Deseas agregar este comentario a la alerta?",
  label: "Agregar Comentario",
  summaryFields: ["content"],
}}
```

- [ ] **Step 7: Run lint to verify no errors**

Run: `pnpm --filter frontend lint`
Expected: PASS (0 errors)

- [ ] **Step 8: Commit**

```bash
git add apps/frontend/src/features/
git commit -m "feat(slide-over-form): add summaryFields to all confirmation dialogs"
```

---

### Task 4: Final verification

- [ ] **Step 1: Run full lint**

Run: `pnpm lint`
Expected: PASS (0 errors, existing warnings only)

- [ ] **Step 2: Manual smoke test**

Verify each confirmation dialog shows the summary:
1. Users edit → summary shows firstName, lastName, email
2. Entities create → summary shows name, label, permissionType
3. Extendidos assign → summary shows ubicacion, baja, extendido
4. A Sembrar complete → summary shows all 10 fields
5. Siembra authorize → summary shows partidaId, anio, indice
6. Alerts comment → summary shows content

- [ ] **Step 3: Final commit if any fixups**

```bash
git add .
git commit -m "fix(slide-over-form): summary dialog fixes from smoke test"
```
