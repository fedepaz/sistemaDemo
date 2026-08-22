# Permissions Module - Design Notes

> **PROJECT:** vivero-client-alpha (AgriManage) — permissions module
> The permissions feature uses the **same design system** as the rest of the app
> (`design-system/vivero-client-alpha/MASTER.md`). This file only documents permissions-specific behavior.

---

## Context

The permissions module lets admins manage:

- **Entities** — which tables are registered for the permission system (`Entity` table, `PermissionType`: CRUD / READ_ONLY / PROCESS).
- **Users** — assign per-entity permissions with scopes `NONE` / `OWN` / `ALL`.

Backend enforcement: `@RequirePermission({ tableName, action, scope })` + `PermissionsService`. `SYSTEM_ENTITIES` (from `@vivero/shared`) hides internal tables from management UIs.

## Page-Specific Rules

### Layout

- Standard app shell (Zero-Scroll). Entity list and permission assignment rendered in `DataTable` + `SlideOverForm`/dialogs.

### DataTable Behavior

- `READ_ONLY` entities: selection and mutation actions hidden.
- `PROCESS` entities: row selection hidden by default; bulk delete disabled when execution (create) is allowed.
- Descriptive action labels (e.g., "Asignar Ubicación") — not generic "Ejecutar".

### Loading

- Route `loading.tsx` + colocated `*Skeleton.tsx` for the data-fetching tables.

### Color / Typography / Spacing

- No overrides — use Master OKLCH tokens, fonts, and compact spacing.

---

## Backend Reference

- `apps/backend/src/modules/permissions/` — service + repository.
- `setPermissionsForUser` replaces a user's permission set atomically (transaction).
- `@vivero/shared` `permissions.schema.ts`: `PermissionScopeSchema`, `PermissionTypeSchema`, `CrudActionSchema`, `EntitySchema`, `CreateEntitySchema`.
