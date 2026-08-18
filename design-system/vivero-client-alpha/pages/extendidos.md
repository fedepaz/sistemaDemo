# Extendidos Page Overrides

> **PROJECT:** vivero-client-alpha (AgriManage)
> **Page Type:** Data view (legacy extended detail records)

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/vivero-client-alpha/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout

- **Full-width** data table inside the standard `100dvh` app shell (Zero-Scroll standard).
- Use the central `DataTable` with export columns (CSV/Excel/PDF).

### Spacing

- **Content Density:** High — optimize for information display.

### Typography

- No overrides — use Master typography.

### Color

- No overrides — use Master OKLCH tokens.

### Components

- `DataTable` + `SlideOverForm` for create/edit.
- Route `loading.tsx` skeleton mirroring the table.

---

## Page-Specific Components

- No unique components — reuse `DataTable`, `SlideOverForm`, and standard skeletons.

---

## Recommendations

- Enforce legacy column limits in `@vivero/shared` Zod schemas (narrow `char(n)` columns).
- Keep the primary field (`detalle`) truncated and the extended field (`extendido`) for full text.
- Allow multi-select and bulk edit where the workflow benefits.
