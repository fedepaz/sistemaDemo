# Alert Forms Consistency Refactor — Extendidos Pattern Alignment

## Overview

Make alert view/edit forms consistent with the extendidos pattern used across the app. Three changes: semantic color tokens, DataTable owns Sheets, and edit form uses Form/formId with conversation + form fields.

## Current State

- **View form** (`alerts-view-form.tsx`): Manages its own Sheet. Colors use raw Tailwind (`text-orange-500`, etc.).
- **Edit form** (`alert-edit-form.tsx`): Self-contained conversation messaging with custom Send button. No `Form`/`formId` integration.
- **DataTable** (`alerts-data-table.tsx`): Passes `formId=""` (disabled) to SlideOverForm. Edit form manages its own submit.
- **KPIs** (`alert-summary-cards.tsx`): Use semantic tokens (`text-warning`, `text-info`).

## Goals

1. All 3 layers (KPIs, view, edit) use the same color system
2. View/edit forms follow extendidos pattern (DataTable owns Sheet)
3. Edit form uses `Form`/`formId` so Sheet footer submits
4. Edit form keeps conversation-style messages + adds structured form fields

---

## Section 1: Semantic Color Tokens

### Current Mismatch

| Location | Siembra | Germinacion | Faltante | Pre-Exp |
|----------|---------|-------------|----------|---------|
| KPIs | `text-warning` | `text-info` | `text-warning` | `text-info` |
| Config | `text-orange-500` | `text-amber-500` | `text-red-500` | `text-blue-500` |

### Target (Unified)

All locations use:

| Alert Type | Token | Severity |
|------------|-------|----------|
| Siembra Retrasada | `text-warning bg-warning/10 border-warning/20` | warning |
| Falta Germinacion | `text-info bg-info/10 border-info/20` | info |
| Faltante Plantas | `text-warning bg-warning/10 border-warning/20` | warning |
| Falta Pre-Expedicion | `text-info bg-info/10 border-info/20` | info |

### Implementation

Update `alert-type-config.ts`:
- Add `borderColor` field to `AlertTypeConfig` interface
- Switch `color`/`bgColor` to semantic tokens

---

## Section 2: View Form — Remove Sheet

### Target (Extendidos Pattern)

Pure content component, no Sheet wrapper. Interface:
```ts
interface AlertsViewFormProps {
  selectedAlert: AlertBaseDto;
  alertType: AlertType;
}
```

DataTable wraps in `SlideOverForm` with `mode="view"`.

---

## Section 3: Edit Form — Form + Conversation Hybrid

### Target (Extendidos Pattern)

- Use `Form {...form}` + `form id="alert-comment-form"` + `form.handleSubmit(onSubmit)`
- Top: conversation message thread (existing bubbles)
- Bottom: `FormField` with `Textarea` for new comment
- No custom Send button — Sheet footer "Enviar" submits via `formId`

Interface:
```ts
interface AlertEditFormProps {
  selectedAlert: AlertBaseDto;
  alertType: AlertType;
  form: UseFormReturn<CreateAlertCommentDto>;
}
```

---

## Section 4: DataTable — Own All Sheets

```tsx
// View
<SlideOverForm mode="view" formId="">
  <AlertsViewForm selectedAlert={...} alertType={...} />
</SlideOverForm>

// Edit
<SlideOverForm mode="edit" formId="alert-comment-form" form={form}>
  <AlertEditForm selectedAlert={...} alertType={...} form={form} />
</SlideOverForm>
```

## Files to Change

| File | Action |
|------|--------|
| `alert-type-config.ts` | MODIFY — add borderColor, semantic tokens |
| `alerts-view-form.tsx` | REWRITE — remove Sheet, pure content |
| `alert-edit-form.tsx` | REWRITE — Form + conversation hybrid |
| `alerts-data-table.tsx` | MODIFY — own all Sheets, create form |

## Constraints

- Follow extendidos patterns (siembra-view-form.tsx, siembra-edit-form.tsx)
- Semantic tokens only (warning, info, danger, success)
- "use client" on all files
- Spanish-only UI strings
- Zero-Scroll design: dvh, flex-1 overflow-hidden
- OKLCH tokens only
