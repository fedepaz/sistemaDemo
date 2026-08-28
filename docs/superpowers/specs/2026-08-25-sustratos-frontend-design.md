# Sustratos Frontend — Design Spec

## Overview

Build the frontend for the `sustratos` (substrates) module. Simple CRUD entity with a single `nombre` field. Backend provides GET all, GET by id, POST create, and PATCH update. Frontend implements **list + create + view** only (no edit/delete for now).

## Scope

- **In scope:** List, create, view detail, navigation integration (sidebar + mobile)
- **Out of scope:** Edit, delete, KPIs (single field doesn't justify them)

## File Structure

Follow the existing `entities` feature pattern exactly:

```
apps/frontend/src/features/sustratos/
├── api/
│   └── sustratoService.ts
├── hooks/
│   └── useSustratos.ts
├── components/
│   ├── columns.tsx
│   ├── sustrato-create-form.tsx
│   ├── sustrato-view-form.tsx
│   ├── sustrato-data-table.tsx
│   └── SustratosDashboard.tsx
├── index.ts
```

Plus:

- `apps/frontend/src/app/(dashboard)/sustratos/page.tsx`

## API Layer

`sustratoService.ts` — uses `clientFetch` from `@/lib/api/client-fetch`:

```ts
fetchAll()  → GET /sustratos       → SustratoDto[]
create(data) → POST /sustratos     → SustratoDto
```

Shared types from `@vivero/shared`: `SustratoDto`, `CreateSustratoDto`, `CreateSustratoSchema`.

## Hooks

`useSustratos.ts` — uses `@tanstack/react-query`:

- `useSustratos()` — `useSuspenseQuery<SustratoDto[]>` with `sustratoQueryKeys.all()`
- `useCreateSustrato()` — `useMutation<SustratoDto, Error, CreateSustratoDto>` with invalidation via `invalidateQueries(queryClient, "createSustrato")`

## Query Keys & Invalidation

Add to `src/lib/queryKeys.ts`:

```ts
export const sustratoQueryKeys = {
  all: () => ["sustratos"] as const,
};
```

Add to `src/lib/query-invalidation-map.ts`:

```ts
createSustrato: {
  queries: () => [sustratoQueryKeys.all()],
},
```

## Components

### SustratosDashboard

Wrapper with `<Suspense>` + skeleton fallbacks. Pattern matches `EntityDashboard`:

- `<DataTableSkeleton>` fallback for the table

### sustratoColumns

Column definitions for `<DataTable>`:

| Column | Header | Cell |
|--------|--------|------|
| `nombre` | Nombre | Font-medium styled text |

### SustratoCreateForm

Single-field form with `react-hook-form` + `zodResolver(CreateSustratoSchema)`:

- `nombre` — text input, required

Uses shadcn `<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<Input>`, `<FormMessage>`.

### SustratoViewForm

Read-only detail view for a selected sustrato. Currently shows only `nombre` and `createdAt`, but structured for future expansion (add fields later without refactoring the layout). Uses `<Card>` + `<InfoRow>` pattern from extendidos view form.

### SustratoDataTable

Main orchestrator component:

- Renders `<DataTable>` with `sustratoColumns`
- "Nuevo Sustrato" button opens `<SlideOverForm>` in `create` mode
- Row click opens `<SlideOverForm>` in `view` mode with `<SustratoViewForm>`
- Uses `useCreateSustrato()` mutation
- `react-hook-form` with `zodResolver(CreateSustratoSchema)` for create form

## Navigation

Add sustratos sub-group to the "Partidas" `nestedGroup` in `src/lib/config/navigations.ts`:

```ts
{
  kind: "subGroup",
  id: "sustratos",
  title: "Sustratos",
  icon: Layers, // or appropriate icon
  items: [
    {
      title: "Lista",
      href: ROUTES.SUSTRATOS,
      icon: Layers,
      description: "Gestión de sustratos",
      dashboard: { statsLabel: "Sustratos" },
      requiredPermission: { table: "sustratos", action: "read" },
    },
  ],
},
```

The desktop sidebar and mobile navigation already render `NavigationSubGroup` items — no changes needed to those components.

## Route

Add to `src/constants/routes.ts`:

```ts
SUSTRATOS: "/sustratos",
```

Page at `src/app/(dashboard)/sustratos/page.tsx`:

```tsx
import { SustratosDashboard } from "@/features/sustratos";
export const dynamic = "force-dynamic";
export default function SustratosPage() {
  return <SustratosDashboard />;
}
```

## Public Exports

`index.ts`:

```ts
export { SustratosDashboard } from "./components/SustratosDashboard";
export { useSustratos, useCreateSustrato } from "./hooks/useSustratos";
export { sustratoService } from "./api/sustratoService";
```

## Permissions

Backend uses `@RequirePermission({ tableName: "sustratos", action: "read" | "create" | "update" })`. Navigation filtering uses `requiredPermission: { table: "sustratos", action: "read" }` to hide the nav item from users without read access.

## Testing

Follow existing patterns — component tests for the form, hook tests for mutations if needed. Not in initial scope but should be added.
