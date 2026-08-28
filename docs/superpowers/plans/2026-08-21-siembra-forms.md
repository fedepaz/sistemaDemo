# Siembra Forms Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update siembra view and edit forms to display all SiembraDto fields, follow extendidos tabbed UX pattern, and implement a confirm-quantity toggle in the edit form.

**Architecture:** Full rewrite of `siembra-view-form.tsx` with tabbed layout (Datos/Notas). Rewrite of `siembra-edit-form.tsx` with camera select, quantity toggle (read-only -> edit), and observations. `siembra-data-table.tsx` already has correct defaults.

**Tech Stack:** React, Next.js 16, shadcn/ui (Tabs, Card, Select, Input, Textarea, Form), lucide-react, react-hook-form, Tailwind CSS v4, @vivero/shared Zod schemas

## Global Constraints

- Spanish-only UI strings
- All data types from `@vivero/shared` -- no local DTO definitions
- Follow existing patterns in `extendido-view-form.tsx` and `extendido-edit-form.tsx`
- Tailwind v4 utility classes -- no custom CSS
- Responsive: mobile-first with `md:` breakpoints
- `max-h-[calc(100dvh-130px)]` scroll containment

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `apps/frontend/src/features/siembra/components/siembra-view-form.tsx` | Rewrite | View form with tabbed layout showing all SiembraDto fields |
| `apps/frontend/src/features/siembra/components/siembra-edit-form.tsx` | Rewrite | Edit form with camera select, quantity toggle, observations |
| `apps/frontend/src/features/siembra/components/siembra-data-table.tsx` | No change | Already has correct defaults with germin injection |

---

### Task 1: Rewrite siembra-view-form.tsx

**Files:**
- Rewrite: `apps/frontend/src/features/siembra/components/siembra-view-form.tsx`

**Interfaces:**
- Consumes: `SiembraDto` from `@vivero/shared`
- Produces: `<SiembraViewForm selectedExtendido={SiembraDto} />` component

- [ ] **Step 1: Write the complete view form**

Replace the entire file. See next message for full code.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm --filter frontend type-check`
Expected: No errors

- [ ] **Step 3: Verify lint passes**

Run: `pnpm --filter frontend lint`
Expected: No new errors (existing warnings OK)

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/features/siembra/components/siembra-view-form.tsx
git commit -m "feat(siembra): rewrite view form with tabbed layout"
```

---

### Task 2: Rewrite siembra-edit-form.tsx

**Files:**
- Rewrite: `apps/frontend/src/features/siembra/components/siembra-edit-form.tsx`

**Interfaces:**
- Consumes: `AsignarUbiSiembraDto`, `SiembraDto` from `@vivero/shared`, `UseFormReturn` from react-hook-form
- Produces: `<SiembraEditForm onSubmit, onCancel, form, selectedExtendido />` component

- [ ] **Step 1: Write the complete edit form**

Replace the entire file. See task 2 code below.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm --filter frontend type-check`
Expected: No errors

- [ ] **Step 3: Verify lint passes**

Run: `pnpm --filter frontend lint`
Expected: No new errors

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/features/siembra/components/siembra-edit-form.tsx
git commit -m "feat(siembra): rewrite edit form with quantity toggle"
```

---

### Task 3: Verify siembra-data-table.tsx (no changes needed)

**Files:**
- No change: `apps/frontend/src/features/siembra/components/siembra-data-table.tsx`

The `useEffect` at line 37-49 already has correct defaults including `germin: parseInt(selectedPartida.germin)`. The submit handler passes formData which includes germin. No changes required.

- [ ] **Step 1: Verify TypeScript compiles**

Run: `pnpm --filter frontend type-check`
Expected: No errors

- [ ] **Step 2: Final full verification**

Run: `pnpm lint && pnpm type-check && pnpm test`
Expected: All pass

- [ ] **Step 3: Final commit (if any remaining changes)**

```bash
git add .
git commit -m "chore(siembra): verify forms integration"
```
