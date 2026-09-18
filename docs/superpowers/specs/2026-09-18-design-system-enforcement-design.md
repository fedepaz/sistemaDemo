# Design System Enforcement Spec

**Date:** 2026-09-18
**Goal:** Enforce consistent usage of existing design tokens across all components. Establish 1366×768 as the primary desktop baseline.

---

## Problem

46 design tokens are defined in `globals.css` but **zero** are used by any component. All 28 shadcn/ui components and all feature components use hardcoded Tailwind values (`h-9`, `text-sm`, `px-4`, etc.) that happen to partially overlap with token values but aren't derived from them. At 1366×768, the UI feels oversized and inconsistent — not because the tokens are wrong, but because they're not enforced.

## Approach

**Global Tailwind theme remap** — Override Tailwind's built-in text size scale in `@theme` to match token values. This makes every component a token consumer with zero code changes for typography. For control heights, add tokens as usable Tailwind values and update shadcn/ui primitives to reference them.

---

## 1. Typography Remap

Override Tailwind's font size utilities in the `@theme inline` block:

| Tailwind class | Default | New value | Token |
|---|---|---|---|
| `text-xs` | 12px | **11px** | `--text-caption` |
| `text-sm` | 14px | **12px** | `--text-body-sm` |
| `text-base` | 16px | **14px** | `--text-body` |
| `text-lg` | 18px | **16px** | `--text-body-lg` |
| `text-xl` | 20px | **18px** | `--text-subtitle` |
| `text-2xl` | 24px | **20px** | `--text-title` |
| `text-3xl` | 30px | **24px** | `--text-heading` |

Add to `@theme inline`:
```css
--text-xs: var(--text-caption);
--text-sm: var(--text-body-sm);
--text-base: var(--text-body);
--text-lg: var(--text-body-lg);
--text-xl: var(--text-subtitle);
--text-2xl: var(--text-title);
--text-3xl: var(--text-heading);
```

**Impact:** All 28 shadcn/ui components + all feature components automatically use correct typography. `text-sm` in a button, input, table cell, or card description all become 12px. `text-base` becomes 14px. This is the single highest-impact change.

---

## 2. Control Height Tokens

Control height tokens are already defined as CSS custom properties in `:root`:

```css
--control-height-xs: 24px;
--control-height-sm: 28px;
--control-height: 32px;
--control-height-md: 36px;
--control-height-lg: 40px;
```

Tailwind v4 supports arbitrary value syntax with CSS variables: `h-(--control-height)` → 32px. No `@theme` remapping needed for these — they're consumed directly via `h-(--control-height)`, `h-(--control-height-sm)`, etc.

### Component updates (shadcn/ui):

| Component | File | Current | New |
|-----------|------|---------|-----|
| `button.tsx` | default | `h-9` (36px) | `h-(--control-height)` (32px) |
| `button.tsx` | sm | `h-8` (32px) | `h-(--control-height-xs)` (24px) |
| `button.tsx` | lg | `h-10` (40px) | `h-(--control-height-lg)` (40px) |
| `button.tsx` | icon | `h-9 w-9` | `h-(--control-height) w-(--control-height)` |
| `input.tsx` | — | `h-9` | `h-(--control-height)` |
| `select.tsx` | trigger | `h-9` | `h-(--control-height)` |
| `tabs.tsx` | trigger | `h-9` | `h-(--control-height)` |
| `toggle.tsx` | default | `h-9` | `h-(--control-height)` |
| `toggle.tsx` | sm | `h-8` | `h-(--control-height-xs)` |
| `toggle.tsx` | lg | `h-10` | `h-(--control-height-lg)` |
| `textarea.tsx` | — | `min-h-[60px]` | `min-h-[calc(var(--control-height)*2)]` |
| `table.tsx` | head | `h-10` (40px) | `h-(--table-header-height)` (36px) |
| `command.tsx` | input | `h-10` | `h-(--control-height-lg)` |
| `alert-dialog.tsx` | — | no height change | Layout-driven |
| `dialog.tsx` | — | no height change | Layout-driven |
| `sheet.tsx` | — | no height change | Layout-driven |
| `card.tsx` | — | no height change | Layout-driven |
| `badge.tsx` | — | no height change | Content-driven |
| `checkbox.tsx` | — | `h-4 w-4` | No change (functional) |
| `switch.tsx` | — | `h-5 w-9` | No change (functional) |
| `avatar.tsx` | — | `h-10 w-10` | No change (intentional) |
| `progress.tsx` | — | `h-2` | No change |
| `separator.tsx` | — | `h-[1px]` | No change |
| `label.tsx` | — | No height | Text only |
| `form.tsx` | desc/msg | `text-[0.8rem]` | `text-sm` |
| `popover.tsx` | — | No height | Layout-driven |
| `tooltip.tsx` | — | No height | Content-driven |
| `scroll-area.tsx` | — | scrollbar width | No change |
| `skeleton.tsx` | — | No height | Content-driven |
| `sonner.tsx` | — | Uses semantic tokens | No change |
| `toggle-group.tsx` | — | `gap-1` | No change |

---

## 3. Layout Token Updates

Update tokens in `:root` for 1366×768 baseline:

```css
--sidebar-width-compact: 160px;  /* was 176px */
--header-height-compact: 40px;   /* was 44px */
```

### Layout component updates:

| Component | File | Current | New |
|-----------|------|---------|-----|
| `desktop-sidebar.tsx` | expanded width | `w-44 xl:w-48 2xl:w-56` | `w-40 xl:w-48 2xl:w-56` |
| `desktop-sidebar.tsx` | collapsed width | `w-14` | No change (56px = `--sidebar-width-collapsed`) |
| `dashboard-header.tsx` | height | `h-11 xl:h-12 2xl:h-14` | `h-10 xl:h-12 2xl:h-14` |
| `dashboard-header.tsx` | week display height | `h-12 xl:h-14` | `h-(--header-height-compact) xl:h-12` |
| `dashboard/layout.tsx` | main padding | `px-3 md:px-4 lg:px-5 xl:px-6 2xl:px-8` | `px-3 md:px-4 lg:px-4 xl:px-5 2xl:px-8` |

---

## 4. Arbitrary Value Cleanup

Replace all `text-[Npx]` with nearest token class:

| Pattern | Replacement | Files affected |
|---------|-------------|----------------|
| `text-[7px]` | Remove or `text-xs` | view forms |
| `text-[8px]` | `text-xs` | sidebar, header, dashboard-kpi |
| `text-[9px]` | `text-xs` | sidebar, mobile-nav, dashboard-alerts |
| `text-[10px]` | `text-xs` | sidebar, header, kpi-card, columns, company-info |
| `text-[11px]` | `text-xs` | data-table, kpi-card, auth-skeleton |
| `text-[12px]` | `text-sm` | sidebar nav title |
| `text-[13px]` | `text-sm` | mobile-nav |
| `text-[0.8rem]` | `text-sm` | form.tsx (description, message) |

### Specific files with arbitrary values:

1. **`desktop-sidebar.tsx`** — 7 occurrences: `text-[8px]`, `text-[12px]`, `text-[9px]`, `text-[10px]` (×4)
2. **`mobile-navigation.tsx`** — 5 occurrences: `text-[13px]`, `text-[9px]`, `text-[10px]` (×3)
3. **`dashboard-header.tsx`** — 6 occurrences: `text-[10px]` (×4), `text-[8px]`, `text-[9px]`
4. **`dashboard-kpi.tsx`** — 4 occurrences: `text-[8px]` (×2), `text-[9px]`, `text-[10px]`
5. **`kpi-card.tsx`** — 3 occurrences: `text-[11px]`, `text-[10px]` (×2)
6. **`data-table.tsx`** — 1 occurrence: `text-[11px]`
7. **`data-table-skeleton.tsx`** — 1 occurrence: `text-[11px]`
8. **`form.tsx`** — 2 occurrences: `text-[0.8rem]` (×2)
9. **`user-data-table.tsx`** — 1 occurrence: `text-[10px]`
10. **`programacionSiembra-data-table.tsx`** — 1 occurrence: `text-[10px]`
11. **`programacionSiembra-view-form.tsx`** — 6 occurrences: various tiny text
12. **`autorizar-programacionSiembra-edit-form.tsx`** — 3 occurrences
13. **`mezclaSelector.tsx`** — 1 occurrence: `text-[10px]`
14. **`company-info-card.tsx`** — 4 occurrences: `text-[10px]`
15. **`company-welcome.tsx`** — 1 occurrence: `text-[10px]`
16. **`permission-row-item.tsx`** — 1 occurrence: `text-[8px]`
17. **`auth-layout-skeleton.tsx`** — 2 occurrences
18. **`auditLog-form.tsx`** — 2 occurrences
19. **`user-sidebar-menu.tsx`** — 2 occurrences: `text-[10px]`

---

## 5. DataTable Token Migration

Replace hardcoded DataTable values with table density tokens:

| Location | Current | New |
|----------|---------|-----|
| Header row height | `h-8 xl:h-9` | `h-(--table-compact-header-height) xl:h-(--table-header-height)` |
| Data row height | `h-8 xl:h-10` | `h-(--table-compact-row-height) xl:h-(--table-row-height)` |
| Header cell padding | `py-1` | `py-(--table-compact-cell-py)` (compact) |
| Data cell padding | `py-0.5 xl:py-1` | `py-(--table-compact-cell-py) xl:py-(--table-cell-py)` |
| Header cell px | inherited | `px-(--table-compact-cell-px) xl:px-(--table-cell-px)` |
| Data cell px | `px-2 xl:px-3` | `px-(--table-compact-cell-px) xl:px-(--table-cell-px)` |
| Search input | `h-7 xl:h-8` | `h-(--control-height-sm) xl:h-(--control-height)` |
| Pagination buttons | `h-6 xl:h-7` | `h-(--control-height-xs) xl:h-(--control-height-sm)` |
| Column filter button | `h-7 xl:h-8` | `h-(--control-height-sm) xl:h-(--control-height)` |
| Create button | `h-7 xl:h-8` | `h-(--control-height-sm) xl:h-(--control-height)` |
| Bulk delete button | `h-7 xl:h-8` | `h-(--control-height-sm) xl:h-(--control-height)` |

Also update `data-table-skeleton.tsx` to match.

---

## 6. What Does NOT Change

- **Mobile experience** — already works, preserved
- **Color system** — OKLCH tokens, semantic colors, all stay
- **Spacing scale** — Tailwind defaults already match `--space-*` tokens
- **Border radius** — Tailwind `rounded-*` already maps to `--radius-*` via `@theme`
- **Dark mode** — still disabled via `forcedTheme="light"`
- **Component APIs** — no prop changes, no breaking changes to component interfaces
- **Icon sizing** — `h-4 w-4` etc. stay as-is (icon sizes are functional, not density-related)

---

## 7. Viewport Behavior Summary

| Viewport | Sidebar | Header | Main padding | Text scale | Controls |
|----------|---------|--------|-------------|------------|----------|
| Mobile (<768px) | Hidden | Mobile nav | px-3 | Same tokens | Same tokens |
| **1366×768** | **160px** | **40px** | **16px** | **Same tokens** | **32px** |
| 1920×1080 | 192px | 44px | 20px | Same tokens | 32px |
| 2560+ | 224px | 48px | 32px | Same tokens | 32px |

---

## 8. Implementation Order

1. **globals.css** — Add `@theme` text remaps + control height spacing values + update layout tokens
2. **shadcn/ui components** — Update button, input, select, tabs, toggle, textarea, table, form, command to use tokens
3. **Layout components** — Header, sidebar, dashboard layout
4. **DataTable + skeleton** — Table density token migration
5. **Arbitrary value cleanup** — Replace all `text-[Npx]` across feature components
6. **Visual verification** — Check each page at 1366×768

---

## 9. Risks

- **Text size reduction** — Components using `text-sm` go from 14px to 12px. Some text may feel too small. Mitigation: visual review at 1366×768, adjust specific components if needed.
- **Control height reduction** — Inputs/buttons go from 36px to 32px. Touch targets shrink. Mitigation: 32px still meets WCAG minimum (24px), and mobile preserves existing sizes.
- **Third-party components** — Tremor charts, recharts, etc. won't use these tokens. They have their own styling. Acceptable — the token system applies to app-owned components.
