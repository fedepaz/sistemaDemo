# Alert Forms Consistency Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make alert view/edit forms consistent with extendidos pattern — semantic colors, DataTable owns Sheets, Form/formId integration.

**Architecture:** Follow extendidos patterns exactly. View form becomes pure content. Edit form uses react-hook-form with conversation + form fields. DataTable manages all Sheets.

**Tech Stack:** React, shadcn/ui, Tailwind CSS, react-hook-form, `useForm`/`Form`/`FormField`/`FormControl`/`FormItem`/`FormLabel`/`FormMessage`.

## Global Constraints

- Follow extendidos patterns: `siembra-view-form.tsx`, `siembra-edit-form.tsx`
- Semantic tokens only: `text-warning`, `text-info`, `text-danger`, `text-success`
- "use client" on all files
- Spanish-only UI strings
- Zero-Scroll design: dvh, flex-1 overflow-hidden
- OKLCH tokens only, no new palettes
- Conventional Commits for commit message

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `apps/frontend/src/features/alerts/components/v1/alert-type-config.ts` | MODIFY | Add `borderColor`, switch to semantic tokens |
| `apps/frontend/src/features/alerts/components/v1/alerts-view-form.tsx` | REWRITE | Pure content component (no Sheet), extendidos layout |
| `apps/frontend/src/features/alerts/components/v1/alert-edit-form.tsx` | REWRITE | Form + conversation hybrid, uses `formId` |
| `apps/frontend/src/features/alerts/components/v1/alerts-data-table.tsx` | MODIFY | Own all Sheets, create form, pass to edit |

---

## Task 1: Update Alert Type Config with Semantic Colors

**Files:**
- Modify: `apps/frontend/src/features/alerts/components/v1/alert-type-config.ts`

**Interfaces:**
- Consumes: Lucide icons, `AlertType` type
- Produces: Updated `AlertTypeConfig` interface with `borderColor`, `ALERT_TYPE_CONFIGS` with semantic tokens

- [ ] **Step 1: Read current file**

Read: `apps/frontend/src/features/alerts/components/v1/alert-type-config.ts`

- [ ] **Step 2: Add borderColor to interface and update configs**

Add `borderColor: string` to `AlertTypeConfig` interface. Update all 4 configs:

```ts
SIEMBRA_RETRASADA: {
  icon: Scissors,
  color: "text-warning",
  bgColor: "bg-warning/10",
  borderColor: "border-warning/20",
  // ... rest unchanged
},
FALTA_GERMINACION: {
  icon: Sprout,
  color: "text-info",
  bgColor: "bg-info/10",
  borderColor: "border-info/20",
  // ... rest unchanged
},
FALTANTE_PLANTAS: {
  icon: AlertTriangle,
  color: "text-warning",
  bgColor: "bg-warning/10",
  borderColor: "border-warning/20",
  // ... rest unchanged
},
FALTA_PRE_EXPEDICION: {
  icon: Package,
  color: "text-info",
  bgColor: "bg-info/10",
  borderColor: "border-info/20",
  // ... rest unchanged
},
```

- [ ] **Step 3: Verify lint**

Run: `pnpm --filter frontend lint`

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/features/alerts/components/v1/alert-type-config.ts
git commit -m "refactor(alerts): use semantic color tokens in alert type config"
```

---

## Task 2: Rewrite View Form (Remove Sheet, Pure Content)

**Files:**
- Rewrite: `apps/frontend/src/features/alerts/components/v1/alerts-view-form.tsx`

**Interfaces:**
- Consumes: `ALERT_TYPE_CONFIGS` from Task 1, `useAlertComments`
- Produces: Pure content component (no Sheet wrapper)

- [ ] **Step 1: Read current file and extendidos reference**

Read: `apps/frontend/src/features/alerts/components/v1/alerts-view-form.tsx`
Read: `apps/frontend/src/features/siembra/components/siembra-view-form.tsx` (reference)

- [ ] **Step 2: Rewrite to match extendidos pattern**

Remove Sheet wrapper. New interface:
```ts
interface AlertsViewFormProps {
  selectedAlert: AlertBaseDto;
  alertType: AlertType;
}
```

Layout matches extendidos:
- Outer div: `flex flex-col gap-3 md:gap-6 animate-in fade-in duration-500 h-full max-h-[calc(100dvh-130px)] md:max-h-[calc(100dvh-140px)] overflow-hidden`
- Header: `bg-primary/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-primary/20 shadow-sm` with config icon + label + partida info
- Spec grid: 4-col grid with `bg-background border border-border/60` cells
- Comments section below

Use `config.borderColor` in header: `border ${config.borderColor}`

- [ ] **Step 3: Verify lint**

Run: `pnpm --filter frontend lint`

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/features/alerts/components/v1/alerts-view-form.tsx
git commit -m "refactor(alerts): view form follows extendidos pattern (no Sheet)"
```

---

## Task 3: Rewrite Edit Form (Form + Conversation Hybrid)

**Files:**
- Rewrite: `apps/frontend/src/features/alerts/components/v1/alert-edit-form.tsx`

**Interfaces:**
- Consumes: `ALERT_TYPE_CONFIGS` from Task 1, `useAlertComments`, `useAlertCommentsMutation`, `useAuthContext`, `UseFormReturn`
- Produces: Form-wrapped component with conversation + FormField

- [ ] **Step 1: Read current file and extendidos reference**

Read: `apps/frontend/src/features/alerts/components/v1/alert-edit-form.tsx`
Read: `apps/frontend/src/features/siembra/components/siembra-edit-form.tsx` (reference)
Read: `apps/frontend/src/features/alerts/hooks/useAlertCommentsMutation.ts` (check mutation signature)

- [ ] **Step 2: Rewrite to use Form + conversation**

New interface:
```ts
interface AlertEditFormProps {
  selectedAlert: AlertBaseDto;
  alertType: AlertType;
  form: UseFormReturn<CreateAlertCommentDto>;
}
```

Structure:
```tsx
<Form {...form}>
  <form
    id="alert-comment-form"
    onSubmit={form.handleSubmit(onSubmit)}
    className="flex flex-col gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full max-h-[calc(100dvh-130px)] md:max-h-[calc(100dvh-140px)] overflow-y-auto no-scrollbar pb-6"
  >
    {/* Type-specific header */}
    {/* Conversation message thread */}
    {/* FormField for new comment */}
  </form>
</Form>
```

- [ ] **Step 3: Verify lint**

Run: `pnpm --filter frontend lint`

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/features/alerts/components/v1/alert-edit-form.tsx
git commit -m "refactor(alerts): edit form uses Form/formId with conversation"
```

---

## Task 4: Update DataTable (Own All Sheets)

**Files:**
- Modify: `apps/frontend/src/features/alerts/components/v1/alerts-data-table.tsx`

**Interfaces:**
- Consumes: Updated `AlertsViewForm` and `AlertEditForm` from Tasks 2-3
- Produces: DataTable that owns all Sheets, creates form

- [ ] **Step 1: Read current file**

Read: `apps/frontend/src/features/alerts/components/v1/alerts-data-table.tsx`

- [ ] **Step 2: Add form creation and wrap both modes in SlideOverForm**

```tsx
import { useForm } from "react-hook-form";
import type { CreateAlertCommentDto } from "@vivero/shared";

// Inside component:
const form = useForm<CreateAlertCommentDto>({
  defaultValues: { content: "" },
});

// View mode:
{selectedAlert && mode === "view" && (
  <SlideOverForm
    open={slideOverOpen}
    onOpenChange={handleOpenChange}
    title={`Partida #${selectedAlert.partidaId}/${selectedAlert.indice}`}
    formId=""
    mode="view"
  >
    <AlertsViewForm
      selectedAlert={selectedAlert}
      alertType={resolvedAlertType}
    />
  </SlideOverForm>
)}

// Edit mode:
{selectedAlert && mode === "edit" && (
  <SlideOverForm
    open={slideOverOpen}
    onOpenChange={handleOpenChange}
    title={`Partida #${selectedAlert.partidaId}/${selectedAlert.indice}`}
    formId="alert-comment-form"
    form={form}
    mode="edit"
  >
    <AlertEditForm
      selectedAlert={selectedAlert}
      alertType={resolvedAlertType}
      form={form}
    />
  </SlideOverForm>
)}
```

- [ ] **Step 3: Verify lint**

Run: `pnpm --filter frontend lint`

- [ ] **Step 4: Run tests**

Run: `pnpm --filter frontend test`

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/features/alerts/components/v1/alerts-data-table.tsx
git commit -m "refactor(alerts): DataTable owns all Sheets and creates form"
```

---

## Task 5: Final Verification

- [ ] **Step 1: Run full lint**

Run: `pnpm lint`

- [ ] **Step 2: Run full type-check**

Run: `npx tsc --noEmit` (in apps/frontend)

- [ ] **Step 3: Run all tests**

Run: `pnpm --filter frontend test`

- [ ] **Step 4: Fix any errors and commit if needed**
