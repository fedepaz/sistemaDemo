# Design Spec: 1366x768 Density Fix

**Date:** 2026-09-18
**Status:** Approved
**Scope:** Layout containers, DataTable, SlideOverForm, form children, feature dashboards

---

## Problem Statement

At 1366x768, the application feels "zoomed in" — all elements appear disproportionately large. Zooming the browser to 70% resolves the issue, confirming the problem is layout proportions, not individual component sizing.

### Root Cause

Layout containers consume too much space relative to the 1366px viewport:

| Container | Pixels | % of 1366px |
|-----------|--------|-------------|
| Sidebar (`xl:w-56`) | 224px | 16.4% |
| Content padding (`xl:px-8`, 2 sides) | 64px | 4.7% |
| **Total overhead** | **288px** | **21.1%** |
| **Available content** | **1078px** | **78.9%** |

At 1920px, the same 288px is only 15% — the proportions are correct there. The sidebar and padding are fixed pixel values that don't scale with viewport width.

### Additional Issues

1. **SlideOverForm stalls at lg:** `lg:max-w-2xl` (672px) never grows at xl. At 1366px, the form uses 62% of available content width.
2. **DataTable column visibility is index-based:** Shows only 5 columns at xl regardless of available width (1078px could fit 7-8 columns).
3. **Form labels are visually heavy:** `text-sm font-black uppercase tracking-widest` (14px, 900 weight) dominates the 624px form content area.
4. **Confirm dialog is oversized:** 48px icon circle, 20px title — appropriate for standalone dialogs but large inside a slide-over workflow.
5. **Pagination text is too small:** `text-[10px]` (10px) at all viewports.

---

## Design Approach: Layout-Adaptive Density

Adjust layout containers to give content more room at xl (1280px). Restore original values at 2xl (1536px). Components stay the same except for typography adjustments in form children.

### Density Tiers

| Tier | Viewport | Sidebar | Header | Padding | Purpose |
|------|----------|---------|--------|---------|---------|
| Compact | lg (1024px) | 176px | 44px | 20px | Tablet/small laptop |
| Standard | xl (1280px) | 192px | 48px | 24px | Laptop (target: 1366px) |
| Spacious | 2xl (1536px) | 224px | 56px | 32px | Desktop |

---

## Changes by Category

### Category 1: Layout Containers

#### 1.1 Desktop Sidebar — `components/layout/desktop-sidebar.tsx`

**Current:** `w-14 lg:w-48 xl:w-56`
**Change to:** `w-14 lg:w-44 xl:w-48 2xl:w-56`

| Breakpoint | Before | After |
|------------|--------|-------|
| lg (1024px) | 192px | 176px |
| xl (1280px) | 224px | 192px |
| 2xl (1536px) | 224px | 224px |

Also update CSS token `--sidebar-width-compact` from 192px to 176px in `globals.css`.

#### 1.2 Dashboard Header — `components/layout/dashboard-header.tsx`

**Current:** `h-12 xl:h-14`
**Change to:** `h-11 xl:h-12 2xl:h-14`

| Breakpoint | Before | After |
|------------|--------|-------|
| xl (1280px) | 56px | 48px |
| 2xl (1536px) | 56px | 56px |

Also update CSS token `--header-height` from 56px to 48px in `globals.css`.

#### 1.3 Dashboard Layout — `app/(dashboard)/layout.tsx`

**Current main padding:** `px-3 md:px-4 lg:px-6 xl:px-8`
**Change to:** `px-3 md:px-4 lg:px-5 xl:px-6 2xl:px-8`

| Breakpoint | Before | After |
|------------|--------|-------|
| lg (1024px) | 24px | 20px |
| xl (1280px) | 32px | 24px |
| 2xl (1536px) | 32px | 32px |

**Current inner spacing:** `space-y-4 pb-1 mb-0.5`
**Change to:** `space-y-3`

Remove `pb-1 mb-0.5` (6px of unnecessary bottom spacing). Change section gap from 16px to 12px.

#### 1.4 CSS Tokens — `app/globals.css`

Update tokens to match new values:

```
--sidebar-width-compact: 176px;  /* was 192px */
--header-height-compact: 48px;   /* was 48px (no change) */
--header-height: 48px;           /* was 56px */
```

Add new intermediate tokens:

```
--sidebar-width-standard: 192px;
--header-height-standard: 48px;
```

### Category 2: DataTable

#### 2.1 Column Visibility — `components/data-display/data-table/data-table.tsx`

**Current:** Index-based count (lines 338-367). `visibleCount = 5` at xl.

**Change to:** Width-aware calculation using container width.

Replace the `useEffect` with a width-aware algorithm:

1. Add a `containerWidth` state measured via `ResizeObserver` on the table wrapper div
2. Calculate max columns based on available width: `floor(availableWidth / (minColumnWidth + cellPadding))`
3. Clamp between 2 and total columns
4. Use this calculated count instead of the fixed `visibleCount`

Min column width: 100px. Cell padding: 24px (12px × 2). Fixed columns (select + actions): ~140px.

**At 1366x768 after layout fixes (1126px content):** After toolbar (~50px), table has ~1076px. Fits ~8-9 data columns instead of 5.

#### 2.2 Pagination Text — `components/data-display/data-table/data-table.tsx`

**Current:** `text-[10px] xl:text-[11px]` on all pagination elements.
**Change to:** `text-xs` (12px).

Affects: selection count text (line 637), page size label (line 644), page info (line 663), page size select (line 654).

#### 2.3 Table Skeleton — `components/data-display/data-table/data-table-skeleton.tsx`

**Current:** Always renders at default density (`h-9` header, `h-10` rows, `text-sm`).
**Change to:** Match actual DataTable density at each breakpoint.

Add responsive classes to match the DataTable's `h-8 xl:h-9` header and `h-8 xl:h-10` row height pattern.

### Category 3: SlideOverForm

#### 3.1 Max-Width — `components/data-display/data-table/slide-over-form.tsx`

**Current:** `sm:max-w-lg md:max-w-xl lg:max-w-2xl`
**Change to:** `sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl`

| Breakpoint | Before | After |
|------------|--------|-------|
| lg (1024px) | 672px | 672px |
| xl (1280px) | 672px | 768px |

#### 3.2 ScrollArea Padding — `slide-over-form.tsx`

**Current:** `px-4 md:px-6 py-3 md:py-4`
**Change to:** `px-4 md:px-5 lg:px-6 py-3 md:py-4`

Adds an intermediate padding step at lg (20px) between md (16px) and xl (24px).

#### 3.3 Children Wrapper — `slide-over-form.tsx`

**Current:** `space-y-4` (line 216)
**Change to:** `space-y-3`

Reduce gap between form sections from 16px to 12px.

#### 3.4 Confirm Dialog — `slide-over-form.tsx`

| Element | Current | Change To |
|---------|---------|-----------|
| Icon circle | `h-12 w-12` (48px) | `h-10 w-10` (40px) |
| Icon | `h-6 w-6` (24px) | `h-5 w-5` (20px) |
| Title | `text-xl` (20px) | `text-lg` (18px) |
| Description | `text-base pt-2` (16px + 8px) | `text-sm pt-1` (14px + 4px) |

#### 3.5 Validation Errors — `slide-over-form.tsx`

**Current:** `mx-6 mt-4` (24px fixed)
**Change to:** `mx-4 md:mx-5 lg:mx-6 mt-3`

Match responsive padding progression.

### Category 4: Form Children (Feature Components)

All forms passed as children to SlideOverForm. At 1366x768 with the form now at 768px (720px content), these adjustments improve density.

#### 4.1 Label Typography (all forms)

**Current pattern:**
```
text-[10px] md:text-sm font-black uppercase tracking-widest
```

**Change to:**
```
text-[10px] md:text-xs font-bold uppercase tracking-wider
```

| Aspect | Before | After |
|--------|--------|-------|
| Font size at md | 14px (text-sm) | 12px (text-xs) |
| Font weight | 900 (font-black) | 700 (font-bold) |
| Letter spacing | 0.1em (tracking-widest) | 0.05em (tracking-wider) |

**Files affected:**
- `features/entities/components/entity-create-form.tsx`
- `features/users/components/user-edit-form.tsx`
- `features/sustratos/components/sustrato-create-form.tsx`
- `features/mezclas/components/mezcla-create-form.tsx`
- `features/extendidos/components/extendido-edit-form.tsx`
- `features/extendidos/components/extendido-view-form.tsx`
- `features/programacionSiembra/components/autorizar-programacionSiembra-edit-form.tsx`
- `features/programacionSiembra/components/programacionSiembra-view-form.tsx`
- `features/aSembrar/components/a-sembrar-edit-form.tsx`
- `features/alerts/components/v1/alert-edit-form.tsx`

#### 4.2 Description Typography (all forms)

**Current:** `text-[9px] md:text-[10px]`
**Change to:** `text-[9px] md:text-[11px]`

Increase from 10px to 11px at md. Reduces label-to-description contrast ratio from 1.4x to 1.09x.

#### 4.3 Product Header Cards

**Files:** `extendido-edit-form.tsx`, `a-sembrar-edit-form.tsx`, `programacionSiembra-edit-form.tsx`

| Element | Current | Change To |
|---------|---------|-----------|
| Container padding | `p-3 md:p-4` | `p-2.5 md:p-3` |
| Container radius | `rounded-xl md:rounded-2xl` | `rounded-xl` |
| Icon container | `h-10 w-10 md:h-12 md:w-12` | `h-8 w-8 md:h-10 md:w-10` |
| Icon padding | `p-1.5 md:p-2` | `p-1.5` |
| Title | `text-base md:text-xl font-black` | `text-base md:text-lg font-bold` |
| Subtitle | `text-[9px] md:text-[10px] font-bold` | `text-[9px] md:text-[10px] font-semibold` |

#### 4.4 ExtendidosEditForm — Stock/Baja Values

**File:** `features/extendidos/components/extendido-edit-form.tsx`

| Element | Current | Change To |
|---------|---------|-----------|
| Read-only display | `text-lg md:text-xl font-black` | `text-base md:text-lg font-bold` |
| Baja input | `text-lg md:text-xl font-bold` | `text-base md:text-lg font-bold` |

#### 4.5 AlertEditForm — Comment Textarea

**File:** `features/alerts/components/v1/alert-edit-form.tsx`

**Current:** `min-h-[80px] md:min-h-[120px] text-sm md:text-base p-4`
**Change to:** `min-h-[60px] md:min-h-[100px] text-sm p-3`

### Category 5: Feature Dashboard Gap Standardization

**Current (inconsistent):**
- Users, AuditLogs: `gap-2 md:gap-3`
- Entities, Sustratos, Mezclas: `gap-3 xl:gap-4`
- Extendidos, ProgramacionSiembra, ASembrar: `space-y-2`
- Alerts: `gap-4`

**Change all to:** `gap-3`

**Files affected:**
- `features/users/components/user-data-table.tsx`
- `features/auditLogs/components/auditLog-data-table.tsx`
- `features/entities/components/entity-data-table.tsx`
- `features/sustratos/components/sustrato-data-table.tsx`
- `features/mezclas/components/mezcla-data-table.tsx`
- `features/extendidos/components/extendido-data-table.tsx`
- `features/programacionSiembra/components/programacionSiembra-data-table.tsx`
- `features/aSembrar/components/a-sembrar-data-table.tsx`
- `features/alerts/components/v1/alerts-data-table.tsx`
- `features/siembraPartidas/components/siembra-partidas-registradas-data-table.tsx`

---

## Impact at 1366x768

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Sidebar | 224px | 192px | −32px |
| Header | 56px | 48px | −8px |
| Padding (2×) | 64px | 48px | −16px |
| **Content width** | **1078px** | **1126px** | **+48px** |
| **Content height** | **700px** | **712px** | **+12px** |
| SlideOverForm | 672px | 768px | +96px |
| Form content | 624px | 720px | +96px |
| Visible table columns | 5 | 7-8 | +2-3 |
| Form label size | 14px | 12px | −2px |
| Form description | 10px | 11px | +1px |
| Confirm icon | 48px | 40px | −8px |
| Confirm title | 20px | 18px | −2px |
| Pagination text | 10px | 12px | +2px |

## Impact at 1920x1080

No visual changes. The 2xl breakpoint restores all original values.

## Impact at 768x1024 (tablet)

Sidebar: 176px (was 192px). Header: 44px (was 48px). Padding: 20px (was 24px). Content gains 36px width. Minimal visual change — tablet already uses compact density.

---

## Files Modified (26 total)

### Layout (4)
1. `components/layout/desktop-sidebar.tsx`
2. `components/layout/dashboard-header.tsx`
3. `app/(dashboard)/layout.tsx`
4. `app/globals.css`

### DataTable (2)
5. `components/data-display/data-table/data-table.tsx`
6. `components/data-display/data-table/data-table-skeleton.tsx`

### SlideOverForm (1)
7. `components/data-display/data-table/slide-over-form.tsx`

### Form Children (15)
8. `features/entities/components/entity-create-form.tsx`
9. `features/users/components/user-edit-form.tsx`
10. `features/sustratos/components/sustrato-create-form.tsx`
11. `features/mezclas/components/mezcla-create-form.tsx`
12. `features/extendidos/components/extendido-edit-form.tsx`
13. `features/extendidos/components/extendido-view-form.tsx`
14. `features/programacionSiembra/components/autorizar-programacionSiembra-edit-form.tsx`
15. `features/programacionSiembra/components/programacionSiembra-view-form.tsx`
16. `features/aSembrar/components/a-sembrar-edit-form.tsx`
17. `features/alerts/components/v1/alert-edit-form.tsx`

### Feature Dashboards (5)
18. `features/users/components/user-data-table.tsx`
19. `features/auditLogs/components/auditLog-data-table.tsx`
20. `features/entities/components/entity-data-table.tsx`
21. `features/sustratos/components/sustrato-data-table.tsx`
22. `features/mezclas/components/mezcla-data-table.tsx`
23. `features/extendidos/components/extendido-data-table.tsx`
24. `features/programacionSiembra/components/programacionSiembra-data-table.tsx`
25. `features/aSembrar/components/a-sembrar-data-table.tsx`
26. `features/alerts/components/v1/alerts-data-table.tsx`
27. `features/siembraPartidas/components/siembra-partidas-registradas-data-table.tsx`

---

## Verification

After implementation, verify at these viewports:
- 1366x768: Primary target — content should feel proportional
- 1280x800: Should use xl tier (192px sidebar, 48px header)
- 1920x1080: Should use 2xl tier (224px sidebar, 56px header) — no visual change from current
- 768x1024: Should use lg tier (176px sidebar, 44px header)
- 1024x768: Should use lg tier — compact density

Run `pnpm lint && pnpm type-check && pnpm test` before committing.
