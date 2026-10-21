# Design: Producto "Sistema Web" badge

Date: 2026-10-21
Status: Approved (brainstorming session, direct implementation chosen)

## Goal

Visually distinguish productos that were **created in the app** (not synced from
the legacy `articulo` catalog) with a small, icon-only badge — in the productos
table and in the view slide-over. No `legacyCodigo` value is ever displayed.

## Semantics

The legacy sync feature (`2026-10-21-legacy-productos-sync-design.md`) links
synced rows via `Producto.legacyCodigo`. Therefore:

- `legacyCodigo === null` → hand-created in the app → show badge
- `legacyCodigo` set → legacy origin → no badge (silent majority in production)

## Contract change

`ProductoSchema` (`packages/shared/src/schemas/productos.schema.ts`) gains:

```ts
legacyCodigo: z.string().nullable(),
```

`ProductosService` maps `legacyCodigo: row.legacyCodigo` in `getAllProductos` /
`getProductoById`; `createProducto` / `updateProducto` return `null` (a row born
in-app is never legacy-linked at creation). No repository, Prisma, or migration
changes — `findAll`/`findById` already return full rows. Create/Update schemas
untouched.

## UI

### Badge (shared visual)

- Icon-only `Sparkles` (lucide) inside the existing shadcn `Badge` shell with
  `variant="outline"`, muted treatment: `text-muted-foreground
  border-border/40 bg-muted/30`, `h-6` (compact badge = `--control-height-xs`),
  `p-0 w-6` square, icon `h-4 w-4` (Zero-Scroll icon size).
- Tooltip: established `Tooltip`/`TooltipTrigger asChild`/`TooltipContent
  side="top" className="bg-popover border-border shadow-xl"` pattern (same as
  auditLogs columns). Text: **"Sistema Web"**.
- `aria-label="Sistema Web"` on the badge element.

### Table (`apps/frontend/src/features/productos/components/columns.tsx`)

Inside the existing `nombre` cell: a flex row with the name and, when
`!legacyCodigo`, the badge. No new column, no export-column change.

### View slide-over (`producto-view-form.tsx`)

Same badge in the header right-slot, adjacent to (independent of) the Inactivo
badge. No InfoRow, no value text.

## Testing (TDD)

- Backend: `productos.service.spec.ts` / `productos.controller.spec.ts`
  fixtures and strict `toEqual` assertions gain `legacyCodigo`; integration
  fixture `mockProductoDto` gains `legacyCodigo: null`.
- Frontend: `ProductoDto` fixtures in both product test files gain the field;
  new assertions — badge rendered when `legacyCodigo: null`, absent when
  `"L001"`; Tooltip mocked per sibling suites.

## Out of scope

- Displaying the `legacyCodigo` value anywhere (table, slide-over, export).
- Create/edit forms (a form cannot know origin at creation time).
- Export columns, dashboard, filters.
