# Permissions Page Overrides

> **PROJECT:** vivero-client-alpha (AgriManage) — permissions module
> **Page Type:** Admin data views (entities + user permissions)

> ⚠️ **IMPORTANT:** This page follows `design-system/vivero-permissions/MASTER.md`
> which in turn delegates to `design-system/vivero-client-alpha/MASTER.md` for all
> global rules (tokens, typography, spacing, components).

---

## Page-Specific Rules

### Layout

- **Entities view:** full-width `DataTable` (registered entities, PermissionType badges).
- **User permission assignment:** `DataTable` with per-entity scope selection, edits via `SlideOverForm` or inline dialog.

### Spacing

- **Content Density:** High — permissions grids are information-dense.

### Typography

- No overrides — use Master typography.

### Color

- No overrides — use Master OKLCH tokens.
- Status/semantic colors only from the token set (no red/green hardcoding).

### Components

- `DataTable`, `SlideOverForm`, `Badge` for PermissionType labels, skeletons.
- Avoid: using arbitrary large `z-index` values; text spanning the full viewport width.

---

## Page-Specific Components

- No unique components — reuse the shared data-table/slide-over infrastructure.

---

## Recommendations

- Accessibility: use icons/text in addition to color for scope/PermissionType.
- `SYSTEM_ENTITIES` must stay filtered out of the management UI (enforced by `@vivero/shared` constant).
