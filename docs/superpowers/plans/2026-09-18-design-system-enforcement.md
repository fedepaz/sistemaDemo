# Design System Enforcement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce consistent design token usage across all components. Remap Tailwind text sizes to match token values. Update shadcn/ui components to use control height tokens. Fix layout for 1366×768 baseline.

**Architecture:** Override Tailwind's text size scale in `@theme inline` to match existing `--text-*` tokens. Update shadcn/ui primitives to reference `--control-height` CSS variables via `h-(--control-height)` syntax. Update layout tokens for tighter 1366×768 experience. Replace arbitrary `text-[Npx]` values with token classes.

**Tech Stack:** Tailwind CSS v4, shadcn/ui (new-york), Next.js 16, React 19

## Global Constraints

- Mobile experience must not change (already works)
- All changes are in `apps/frontend/src/`
- Dark mode stays disabled (`forcedTheme="light"`)
- Component APIs and behavior unchanged — only visual sizing
- Token values: `--control-height: 32px`, `--text-body: 14px`, `--text-body-sm: 12px`, `--text-caption: 11px`
- `--sidebar-width-compact: 160px`, `--header-height-compact: 40px`

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/app/globals.css` | Typography remap in `@theme`, layout token updates |
| `src/components/ui/button.tsx` | Control height tokens for button sizes |
| `src/components/ui/input.tsx` | Control height token for input |
| `src/components/ui/select.tsx` | Control height token for select trigger |
| `src/components/ui/textarea.tsx` | Control height token for textarea min-height |
| `src/components/ui/tabs.tsx` | Control height token for tab triggers |
| `src/components/ui/toggle.tsx` | Control height tokens for toggle sizes |
| `src/components/ui/toggle-group.tsx` | No changes needed |
| `src/components/ui/command.tsx` | Control height token for command input |
| `src/components/ui/table.tsx` | Table density token for header height |
| `src/components/ui/form.tsx` | Replace `text-[0.8rem]` with `text-sm` |
| `src/components/ui/badge.tsx` | No height change (content-driven) |
| `src/components/ui/avatar.tsx` | No change (intentional sizing) |
| `src/components/ui/checkbox.tsx` | No change (functional sizing) |
| `src/components/ui/switch.tsx` | No change (functional sizing) |
| `src/components/ui/progress.tsx` | No change |
| `src/components/ui/dialog.tsx` | No height change (layout-driven) |
| `src/components/ui/sheet.tsx` | No height change (layout-driven) |
| `src/components/ui/alert-dialog.tsx` | No height change (layout-driven) |
| `src/components/ui/card.tsx` | No change (layout-driven) |
| `src/components/ui/alert.tsx` | No change |
| `src/components/ui/dropdown-menu.tsx` | No change |
| `src/components/ui/tooltip.tsx` | No change |
| `src/components/ui/popover.tsx` | No change |
| `src/components/ui/label.tsx` | No change (text only) |
| `src/components/ui/separator.tsx` | No change |
| `src/components/ui/scroll-area.tsx` | No change |
| `src/components/ui/skeleton.tsx` | No change |
| `src/components/ui/sonner.tsx` | No change |
| `src/components/layout/desktop-sidebar.tsx` | Width token + arbitrary text cleanup |
| `src/components/layout/dashboard-header.tsx` | Height token + arbitrary text cleanup |
| `src/app/(dashboard)/layout.tsx` | Main padding adjustment |
| `src/components/data-display/data-table/data-table.tsx` | Table density tokens + arbitrary text cleanup |
| `src/components/data-display/data-table/data-table-skeleton.tsx` | Table density tokens |
| `src/components/data-display/data-table/slide-over-form.tsx` | No changes needed |
| `src/features/dashboard/components/dashboard-kpi.tsx` | Arbitrary text cleanup |
| `src/features/dashboard/components/dashboard-alerts.tsx` | Arbitrary text cleanup |
| `src/components/common/kpi-card.tsx` | Arbitrary text cleanup |
| `src/components/common/user-sidebar-menu.tsx` | Arbitrary text cleanup |
| `src/components/common/user-avatar.tsx` | No changes needed |
| `src/features/users/components/user-data-table.tsx` | Arbitrary text cleanup |
| `src/features/programacionSiembra/components/programacionSiembra-data-table.tsx` | Arbitrary text cleanup |
| `src/features/programacionSiembra/components/programacionSiembra-view-form.tsx` | Arbitrary text cleanup |
| `src/features/programacionSiembra/components/autorizar-programacionSiembra-edit-form.tsx` | Arbitrary text cleanup |
| `src/features/programacionSiembra/components/mezclaSelector.tsx` | Arbitrary text cleanup |
| `src/features/entities/components/company-info-card.tsx` | Arbitrary text cleanup |
| `src/features/entities/components/company-welcome.tsx` | Arbitrary text cleanup |
| `src/features/permissions/components/permission-row-item.tsx` | Arbitrary text cleanup |
| `src/components/auth/auth-layout-skeleton.tsx` | Arbitrary text cleanup |
| `src/features/auditLogs/components/auditLog-form.tsx` | Arbitrary text cleanup |

---

### Task 1: Typography Remap in globals.css

**Files:**
- Modify: `apps/frontend/src/app/globals.css:176-248` (the `@theme inline` block)

**Interfaces:**
- Consumes: Existing `--text-*` tokens defined in `:root` (lines 99-106)
- Produces: Remapped `--text-xs` through `--text-3xl` in `@theme inline` that all Tailwind text utilities reference

- [ ] **Step 1: Add typography remaps to `@theme inline` block**

In `apps/frontend/src/app/globals.css`, add the following inside the `@theme inline { ... }` block, after the existing `--font-serif` line (around line 231):

```css
  /* Typography: remap Tailwind text sizes to token values */
  --text-xs: var(--text-caption);      /* 11px (was 12px) */
  --text-sm: var(--text-body-sm);      /* 12px (was 14px) */
  --text-base: var(--text-body);       /* 14px (was 16px) */
  --text-lg: var(--text-body-lg);      /* 16px (was 18px) */
  --text-xl: var(--text-subtitle);     /* 18px (was 20px) */
  --text-2xl: var(--text-title);       /* 20px (was 24px) */
  --text-3xl: var(--text-heading);     /* 24px (was 30px) */
```

- [ ] **Step 2: Update layout tokens in `:root`**

In the same file, update the sidebar and header tokens (lines 109, 114):

```css
  /* Sidebar tokens */
  --sidebar-width-compact: 160px;  /* was 176px */

  /* Header tokens */
  --header-height-compact: 40px;   /* was 44px */
```

- [ ] **Step 3: Verify the CSS compiles**

Run: `pnpm --filter frontend dev` (start dev server, check for CSS errors in terminal)
Expected: No CSS compilation errors. The app loads with visibly smaller text across all pages.

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/app/globals.css
git commit -m "feat(design-system): remap Tailwind text sizes to token values and update layout tokens

- text-xs: 12px → 11px, text-sm: 14px → 12px, text-base: 16px → 14px
- text-lg: 18px → 16px, text-xl: 20px → 18px, text-2xl: 24px → 20px
- text-3xl: 30px → 24px
- sidebar-width-compact: 176px → 160px
- header-height-compact: 44px → 40px"
```

---

### Task 2: shadcn/ui Button Component — Control Height Tokens

**Files:**
- Modify: `apps/frontend/src/components/ui/button.tsx`

**Interfaces:**
- Consumes: `--control-height` (32px), `--control-height-xs` (24px), `--control-height-lg` (40px) from globals.css
- Produces: Button component with token-based heights. Later tasks rely on button heights being 32px (default), 24px (sm), 40px (lg).

- [ ] **Step 1: Update button size variants**

Read `apps/frontend/src/components/ui/button.tsx`, then replace the `size` variants section. The current sizes are:

```tsx
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
```

Replace with:

```tsx
      size: {
        default: "h-(--control-height) px-4 py-2",
        sm: "h-(--control-height-xs) rounded-md px-3 text-xs",
        lg: "h-(--control-height-lg) rounded-md px-8",
        icon: "h-(--control-height) w-(--control-height)",
      },
```

- [ ] **Step 2: Verify button renders correctly**

Run: `pnpm --filter frontend dev`
Expected: Buttons are 32px tall (default), 24px (sm), 40px (lg). Visually smaller than before.

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/ui/button.tsx
git commit -m "feat(design-system): update button to use control height tokens"
```

---

### Task 3: shadcn/ui Input, Select, Textarea — Control Height Tokens

**Files:**
- Modify: `apps/frontend/src/components/ui/input.tsx`
- Modify: `apps/frontend/src/components/ui/select.tsx`
- Modify: `apps/frontend/src/components/ui/textarea.tsx`

**Interfaces:**
- Consumes: `--control-height` (32px) from globals.css
- Produces: Input/Select/Textarea with token-based heights

- [ ] **Step 1: Update input.tsx**

Read `apps/frontend/src/components/ui/input.tsx`. Replace `h-9` with `h-(--control-height)`:

Current (line ~11):
```tsx
<h-9 flex w-full rounded-md border border-input bg-background px-3 py-1 text-base ...
```

New:
```tsx
<h-(--control-height) flex w-full rounded-md border border-input bg-background px-3 py-1 text-base ...
```

Also change `md:text-sm` to just `text-sm` (the remap handles sizing):
```tsx
... text-base md:text-sm ...
```
becomes:
```tsx
... text-sm ...
```

- [ ] **Step 2: Update select.tsx**

Read `apps/frontend/src/components/ui/select.tsx`. Find the `SelectTrigger` component. Replace `h-9` with `h-(--control-height)`:

Current:
```tsx
<h-9 flex w-full items-center justify-between whitespace-nowrap rounded-md border ...
```

New:
```tsx
<h-(--control-height) flex w-full items-center justify-between whitespace-nowrap rounded-md border ...
```

- [ ] **Step 3: Update textarea.tsx**

Read `apps/frontend/src/components/ui/textarea.tsx`. Replace `min-h-[60px]` with `min-h-[calc(var(--control-height)*2)]` and `md:text-sm` with `text-sm`:

Current:
```tsx
<textarea className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm ...
```

New:
```tsx
<textarea className="min-h-[calc(var(--control-height)*2)] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ...
```

- [ ] **Step 4: Verify form controls render correctly**

Run: `pnpm --filter frontend dev`
Expected: Inputs, selects, and textareas are 32px tall. Textarea min-height is 64px.

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/components/ui/input.tsx apps/frontend/src/components/ui/select.tsx apps/frontend/src/components/ui/textarea.tsx
git commit -m "feat(design-system): update input, select, textarea to use control height tokens"
```

---

### Task 4: shadcn/ui Tabs, Toggle, Command — Control Height Tokens

**Files:**
- Modify: `apps/frontend/src/components/ui/tabs.tsx`
- Modify: `apps/frontend/src/components/ui/toggle.tsx`
- Modify: `apps/frontend/src/components/ui/command.tsx`

**Interfaces:**
- Consumes: `--control-height` (32px), `--control-height-xs` (24px), `--control-height-lg` (40px) from globals.css
- Produces: Tabs/Toggle/Command with token-based heights

- [ ] **Step 1: Update tabs.tsx**

Read `apps/frontend/src/components/ui/tabs.tsx`. Find the `tabsList` variant. Replace `h-9` with `h-(--control-height)`:

Current:
```tsx
      tabsList: "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
```

New:
```tsx
      tabsList: "inline-flex h-(--control-height) items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
```

- [ ] **Step 2: Update toggle.tsx**

Read `apps/frontend/src/components/ui/toggle.tsx`. Replace the `size` variants:

Current:
```tsx
      size: {
        default: "h-9 px-3",
        sm: "h-8 px-2",
        lg: "h-10 px-3",
      },
```

New:
```tsx
      size: {
        default: "h-(--control-height) px-3",
        sm: "h-(--control-height-xs) px-2",
        lg: "h-(--control-height-lg) px-3",
      },
```

- [ ] **Step 3: Update command.tsx**

Read `apps/frontend/src/components/ui/command.tsx`. Find the `CommandInput` component. Replace `h-10` with `h-(--control-height-lg)`:

Current:
```tsx
<h-10 flex w-full rounded-md bg-transparent py-3 text-sm outline-none ...
```

New:
```tsx
<h-(--control-height-lg) flex w-full rounded-md bg-transparent py-3 text-sm outline-none ...
```

- [ ] **Step 4: Verify tabs, toggles, and command render correctly**

Run: `pnpm --filter frontend dev`
Expected: Tabs triggers are 32px. Toggles are 32px (default), 24px (sm), 40px (lg). Command input is 40px.

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/components/ui/tabs.tsx apps/frontend/src/components/ui/toggle.tsx apps/frontend/src/components/ui/command.tsx
git commit -m "feat(design-system): update tabs, toggle, command to use control height tokens"
```

---

### Task 5: shadcn/ui Table, Form — Density and Typography Tokens

**Files:**
- Modify: `apps/frontend/src/components/ui/table.tsx`
- Modify: `apps/frontend/src/components/ui/form.tsx`

**Interfaces:**
- Consumes: `--table-header-height` (36px) from globals.css, remapped `text-sm` (12px)
- Produces: Table with token-based header height, form with consistent typography

- [ ] **Step 1: Update table.tsx**

Read `apps/frontend/src/components/ui/table.tsx`. Find the `TableHeader` component. Replace `h-10` with `h-(--table-header-height)`:

Current:
```tsx
<th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground ...
```

New:
```tsx
<th className="h-(--table-header-height) px-2 text-left align-middle font-medium text-muted-foreground ...
```

- [ ] **Step 2: Update form.tsx**

Read `apps/frontend/src/components/ui/form.tsx`. Find `FormDescription` and `FormMessage` components. Replace `text-[0.8rem]` with `text-sm`:

Current (FormDescription):
```tsx
<p className="text-[0.8rem] text-muted-foreground" ...
```

New:
```tsx
<p className="text-sm text-muted-foreground" ...
```

Same change for FormMessage.

- [ ] **Step 3: Verify table and form render correctly**

Run: `pnpm --filter frontend dev`
Expected: Table headers are 36px. Form descriptions and messages use 12px text (text-sm after remap).

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/components/ui/table.tsx apps/frontend/src/components/ui/form.tsx
git commit -m "feat(design-system): update table and form to use density/typography tokens"
```

---

### Task 6: Layout Components — Header, Sidebar, Dashboard Layout

**Files:**
- Modify: `apps/frontend/src/components/layout/dashboard-header.tsx`
- Modify: `apps/frontend/src/components/layout/desktop-sidebar.tsx`
- Modify: `apps/frontend/src/app/(dashboard)/layout.tsx`

**Interfaces:**
- Consumes: `--header-height-compact` (40px), `--sidebar-width-compact` (160px) from globals.css
- Produces: Layout shell with token-based dimensions at 1366×768

- [ ] **Step 1: Update dashboard-header.tsx**

Read `apps/frontend/src/components/layout/dashboard-header.tsx`.

**Line 57** — Replace header height:
Current: `flex h-11 xl:h-12 2xl:h-14 items-center justify-between`
New: `flex h-10 xl:h-12 2xl:h-14 items-center justify-between`

**Lines ~132-137** — Fix week display height overflow:
Find the week display container. Current uses `h-12 xl:h-14` which overflows the header.
Replace `h-12 xl:h-14` with `h-(--header-height-compact) xl:h-12`.

Also fix the "SEMANA" label arbitrary text:
Current: `text-[8px] xl:text-[9px]`
New: `text-xs`

- [ ] **Step 2: Update desktop-sidebar.tsx**

Read `apps/frontend/src/components/layout/desktop-sidebar.tsx`.

**Line ~314** — Update expanded sidebar width:
Current: `isCollapsed ? "w-14" : "w-44 xl:w-48 2xl:w-56"`
New: `isCollapsed ? "w-14" : "w-40 xl:w-48 2xl:w-56"`

**Arbitrary text replacements** (7 occurrences):
- `text-[8px]` → `text-xs` (collapsed badge)
- `text-[12px]` → `text-sm` (nav item title)
- `text-[9px]` → `text-xs` (expanded badge)
- `text-[10px]` → `text-xs` (nav item description, group labels ×3)

- [ ] **Step 3: Update dashboard layout padding**

Read `apps/frontend/src/app/(dashboard)/layout.tsx`.

**Line ~26** — Adjust main content padding at lg breakpoint:
Current: `px-3 md:px-4 lg:px-5 xl:px-6 2xl:px-8`
New: `px-3 md:px-4 lg:px-4 xl:px-5 2xl:px-8`

- [ ] **Step 4: Verify layout at 1366×768**

Run: `pnpm --filter frontend dev`
Resize browser to 1366×768. Verify:
- Sidebar is 160px wide
- Header is 40px tall
- Week display doesn't overflow header
- Main content has 16px horizontal padding
- Nav text uses token sizes

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/components/layout/dashboard-header.tsx apps/frontend/src/components/layout/desktop-sidebar.tsx apps/frontend/src/app/\(dashboard\)/layout.tsx
git commit -m "feat(design-system): update layout components to use tokens for 1366×768 baseline"
```

---

### Task 7: DataTable + Skeleton — Table Density Tokens

**Files:**
- Modify: `apps/frontend/src/components/data-display/data-table/data-table.tsx`
- Modify: `apps/frontend/src/components/data-display/data-table/data-table-skeleton.tsx`

**Interfaces:**
- Consumes: `--table-compact-header-height` (32px), `--table-compact-row-height` (32px), `--table-header-height` (36px), `--table-row-height` (40px), `--table-compact-cell-px` (8px), `--table-cell-px` (12px), `--table-compact-cell-py` (2px), `--table-cell-py` (4px), `--control-height-sm` (28px), `--control-height` (32px), `--control-height-xs` (24px) from globals.css
- Produces: DataTable with token-based density at all viewports

- [ ] **Step 1: Update data-table.tsx header row**

Read `apps/frontend/src/components/data-display/data-table/data-table.tsx`.

Find the `TableHead` rendering (around line 595). Replace hardcoded heights with tokens:

Current:
```tsx
<h-8 xl:h-9 py-1 text-xs ...
```

New:
```tsx
h-(--table-compact-header-height) xl:h-(--table-header-height) py-1 text-xs ...
```

- [ ] **Step 2: Update data-table.tsx data rows**

Find the `TableCell` rendering (around line 623). Replace with tokens:

Current:
```tsx
py-0.5 xl:py-1 px-2 xl:px-3 text-xs xl:text-sm h-8 xl:h-10
```

New:
```tsx
py-(--table-compact-cell-py) xl:py-(--table-cell-py) px-(--table-compact-cell-px) xl:px-(--table-cell-px) text-xs xl:text-sm h-(--table-compact-row-height) xl:h-(--table-row-height)
```

- [ ] **Step 3: Update data-table.tsx toolbar and pagination**

Find search input (around line 467):
Current: `h-7 xl:h-8`
New: `h-(--control-height-sm) xl:h-(--control-height)`

Find column filter button (around line 488):
Current: `h-7 xl:h-8`
New: `h-(--control-height-sm) xl:h-(--control-height)`

Find create button (around line 532):
Current: `h-7 xl:h-8`
New: `h-(--control-height-sm) xl:h-(--control-height)`

Find bulk delete button (around line 563):
Current: `h-7 xl:h-8`
New: `h-(--control-height-sm) xl:h-(--control-height)`

Find pagination buttons (around lines 667-744):
Current: `h-6 xl:h-7`
New: `h-(--control-height-xs) xl:h-(--control-height-sm)`

Find search result count (around line 479):
Current: `text-[11px]`
New: `text-xs`

- [ ] **Step 4: Update data-table-skeleton.tsx**

Read `apps/frontend/src/components/data-display/data-table/data-table-skeleton.tsx`.

Replace header skeleton heights:
Current: `h-8 xl:h-9`
New: `h-(--table-compact-header-height) xl:h-(--table-header-height)`

Replace row skeleton heights:
Current: `h-8 xl:h-10`
New: `h-(--table-compact-row-height) xl:h-(--table-row-height)`

Replace skeleton text:
Current: `text-[11px]`
New: `text-xs`

- [ ] **Step 5: Verify DataTable renders correctly**

Run: `pnpm --filter frontend dev`
Navigate to any page with a DataTable. Verify:
- Table headers are 32px (compact) / 36px (standard)
- Data rows are 32px (compact) / 40px (standard)
- Search, filter, and create buttons are 28px / 32px
- Pagination controls are 24px / 28px

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/components/data-display/data-table/data-table.tsx apps/frontend/src/components/data-display/data-table/data-table-skeleton.tsx
git commit -m "feat(design-system): update DataTable to use table density tokens"
```

---

### Task 8: Arbitrary Text Value Cleanup — Dashboard Components

**Files:**
- Modify: `apps/frontend/src/features/dashboard/components/dashboard-kpi.tsx`
- Modify: `apps/frontend/src/features/dashboard/components/dashboard-alerts.tsx`
- Modify: `apps/frontend/src/components/common/kpi-card.tsx`
- Modify: `apps/frontend/src/components/common/user-sidebar-menu.tsx`
- Modify: `apps/frontend/src/components/layout/mobile-navigation.tsx`

**Interfaces:**
- Consumes: Remapped text-xs (11px), text-sm (12px) from Task 1
- Produces: Dashboard and navigation components with consistent typography tokens

- [ ] **Step 1: Update dashboard-kpi.tsx**

Read `apps/frontend/src/features/dashboard/components/dashboard-kpi.tsx`.

Replace all arbitrary text sizes:
- `text-[8px]` → `text-xs` (KPI labels, occurrences at lines ~71, ~118)
- `text-[9px]` → `text-xs` (KPI unit, line ~85)
- `text-[10px]` → `text-xs` (KPI descriptions, lines ~77, ~137)

- [ ] **Step 2: Update dashboard-alerts.tsx**

Read `apps/frontend/src/features/dashboard/components/dashboard-alerts.tsx`.

Replace all arbitrary text sizes:
- `text-[7px]` → `text-xs` (smallest labels)
- `text-[8px]` → `text-xs`
- `text-[9px]` → `text-xs`
- `text-[10px]` → `text-xs`
- `text-[11px]` → `text-xs`

Search for all `text-\[` patterns in this file and replace each with the nearest `text-xs` or `text-sm`.

- [ ] **Step 3: Update kpi-card.tsx**

Read `apps/frontend/src/components/common/kpi-card.tsx`.

Replace:
- `text-[11px]` → `text-xs` (title, line ~31)
- `text-[10px]` → `text-xs` (description and trend, lines ~37, ~40)

- [ ] **Step 4: Update user-sidebar-menu.tsx**

Read `apps/frontend/src/components/common/user-sidebar-menu.tsx`.

Replace:
- `text-[10px]` → `text-xs` (username, line ~67)
- `text-[10px]` → `text-xs` (tooltip username, line ~82)

- [ ] **Step 5: Update mobile-navigation.tsx**

Read `apps/frontend/src/components/layout/mobile-navigation.tsx`.

Replace:
- `text-[13px]` → `text-sm` (nav item title, line ~63)
- `text-[9px]` → `text-xs` (badge text, line ~68)
- `text-[10px]` → `text-xs` (group labels, lines ~103, ~153, ~180)

- [ ] **Step 6: Verify dashboard and navigation render correctly**

Run: `pnpm --filter frontend dev`
Navigate to dashboard. Verify:
- KPI labels and values use consistent token sizes
- Currency alerts use consistent token sizes
- Sidebar menu text uses token sizes
- Mobile nav uses token sizes

- [ ] **Step 7: Commit**

```bash
git add apps/frontend/src/features/dashboard/components/dashboard-kpi.tsx apps/frontend/src/features/dashboard/components/dashboard-alerts.tsx apps/frontend/src/components/common/kpi-card.tsx apps/frontend/src/components/common/user-sidebar-menu.tsx apps/frontend/src/components/layout/mobile-navigation.tsx
git commit -m "feat(design-system): replace arbitrary text sizes in dashboard and navigation with tokens"
```

---

### Task 9: Arbitrary Text Value Cleanup — Feature Components

**Files:**
- Modify: `apps/frontend/src/features/users/components/user-data-table.tsx`
- Modify: `apps/frontend/src/features/programacionSiembra/components/programacionSiembra-data-table.tsx`
- Modify: `apps/frontend/src/features/programacionSiembra/components/programacionSiembra-view-form.tsx`
- Modify: `apps/frontend/src/features/programacionSiembra/components/autorizar-programacionSiembra-edit-form.tsx`
- Modify: `apps/frontend/src/features/programacionSiembra/components/mezclaSelector.tsx`
- Modify: `apps/frontend/src/features/entities/components/company-info-card.tsx`
- Modify: `apps/frontend/src/features/entities/components/company-welcome.tsx`
- Modify: `apps/frontend/src/features/permissions/components/permission-row-item.tsx`
- Modify: `apps/frontend/src/components/auth/auth-layout-skeleton.tsx`
- Modify: `apps/frontend/src/features/auditLogs/components/auditLog-form.tsx`

**Interfaces:**
- Consumes: Remapped text-xs (11px), text-sm (12px) from Task 1
- Produces: All remaining feature components with consistent typography tokens

- [ ] **Step 1: Update user-data-table.tsx**

Read `apps/frontend/src/features/users/components/user-data-table.tsx`.
Replace `text-[10px]` → `text-xs` (activate badge, line ~118).

- [ ] **Step 2: Update programacionSiembra-data-table.tsx**

Read `apps/frontend/src/features/programacionSiembra/components/programacionSiembra-data-table.tsx`.
Replace `text-[10px]` → `text-xs` (week selector, line ~154).

- [ ] **Step 3: Update programacionSiembra-view-form.tsx**

Read `apps/frontend/src/features/programacionSiembra/components/programacionSiembra-view-form.tsx`.
Replace all `text-[7px]` through `text-[11px]` with `text-xs`. There are ~6 occurrences (lines ~42, ~70, ~93, ~96, ~151, ~154).

- [ ] **Step 4: Update autorizar-programacionSiembra-edit-form.tsx**

Read `apps/frontend/src/features/programacionSiembra/components/autorizar-programacionSiembra-edit-form.tsx`.
Replace `text-[10px]` → `text-xs` (lines ~20, ~84, ~98).

- [ ] **Step 5: Update mezclaSelector.tsx**

Read `apps/frontend/src/features/programacionSiembra/components/mezclaSelector.tsx`.
Replace `text-[10px]` → `text-xs` (form label, line ~46).

- [ ] **Step 6: Update company-info-card.tsx**

Read `apps/frontend/src/features/entities/components/company-info-card.tsx`.
Replace `text-[10px]` → `text-xs` (info labels, lines ~112, ~134, ~161, ~169).

- [ ] **Step 7: Update company-welcome.tsx**

Read `apps/frontend/src/features/entities/components/company-welcome.tsx`.
Replace `text-[10px]` → `text-xs` (tagline, line ~37).

- [ ] **Step 8: Update permission-row-item.tsx**

Read `apps/frontend/src/features/permissions/components/permission-row-item.tsx`.
Replace `text-[8px]` → `text-xs` (permission text, line ~230).

- [ ] **Step 9: Update auth-layout-skeleton.tsx**

Read `apps/frontend/src/components/auth/auth-layout-skeleton.tsx`.
Replace:
- `text-[11px]` → `text-xs` (line ~23)
- `text-[10px]` → `text-xs` (line ~26)

- [ ] **Step 10: Update auditLog-form.tsx**

Read `apps/frontend/src/features/auditLogs/components/auditLog-form.tsx`.
Replace:
- `text-[10px]` → `text-xs` (line ~158)
- `text-[9px]` → `text-xs` (line ~296)

- [ ] **Step 11: Verify all feature pages render correctly**

Run: `pnpm --filter frontend dev`
Navigate to each feature page and verify text uses consistent token sizes. Check:
- Users page (data table, activate badge)
- Programación Siembra (data table, view form, edit form, mezcla selector)
- Entities (company info card, welcome)
- Permissions (permission rows)
- Auth (login skeleton)
- Audit Logs (form)

- [ ] **Step 12: Commit**

```bash
git add apps/frontend/src/features/users/components/user-data-table.tsx apps/frontend/src/features/programacionSiembra/components/programacionSiembra-data-table.tsx apps/frontend/src/features/programacionSiembra/components/programacionSiembra-view-form.tsx apps/frontend/src/features/programacionSiembra/components/autorizar-programacionSiembra-edit-form.tsx apps/frontend/src/features/programacionSiembra/components/mezclaSelector.tsx apps/frontend/src/features/entities/components/company-info-card.tsx apps/frontend/src/features/entities/components/company-welcome.tsx apps/frontend/src/features/permissions/components/permission-row-item.tsx apps/frontend/src/components/auth/auth-layout-skeleton.tsx apps/frontend/src/features/auditLogs/components/auditLog-form.tsx
git commit -m "feat(design-system): replace arbitrary text sizes in feature components with tokens"
```

---

### Task 10: Visual Verification and Final Cleanup

**Files:**
- No new files. Verify all changes work together.

**Interfaces:**
- Consumes: All previous tasks
- Produces: Verified, consistent design system across the entire application

- [ ] **Step 1: Run build to verify no compilation errors**

Run: `pnpm --filter @vivero/shared build && pnpm --filter frontend build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Visual verification at 1366×768**

Start dev server: `pnpm --filter frontend dev`

Open browser and resize to exactly 1366×768. Check each page:

**Dashboard:**
- KPI cards use consistent text sizes
- Currency alerts are legible
- Grid layout fits without horizontal scroll

**Data Tables (any table page):**
- Headers are 32-36px
- Rows are 32-40px
- Search/filter/create buttons are 28-32px
- Pagination fits on one line

**Forms (any form page):**
- Inputs are 32px tall
- Labels and descriptions use token sizes
- Form fits without excessive whitespace

**Sidebar:**
- 160px wide
- Navigation text is legible
- Collapse/expand works

**Header:**
- 40px tall
- Week display doesn't overflow
- All header elements fit

- [ ] **Step 3: Visual verification at 1920×1080**

Resize browser to 1920×1080. Verify:
- Sidebar is 192px
- Header is 44px
- Content has more breathing room
- No stretched or broken layouts

- [ ] **Step 4: Visual verification on mobile**

Open browser dev tools, toggle device toolbar, check iPhone/Android sizes. Verify:
- Mobile experience unchanged
- Text sizes look correct
- No layout breakage

- [ ] **Step 5: Run lint and type check**

Run: `pnpm lint && pnpm type-check`
Expected: No errors.

- [ ] **Step 6: Final commit (if any fixes needed)**

If any visual fixes were needed during verification, commit them:

```bash
git add -A
git commit -m "fix(design-system): visual adjustments from verification pass"
```
