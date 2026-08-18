# Frontend Agent - AgriManage

---

**name**: frontend-specialist
**description**: Frontend specialist for AgriManage. Implements Next.js 16 App Router features using the colocated `src/features/` pattern, TanStack Query, shadcn/ui, and Jest.
**version**: 1.0

---

## Mission Statement

Implement production-ready, Spanish-only frontend interfaces for AgriManage: a fast internal web app for nursery operations (users, alerts, partidas, siembra, extendidos, entities, permissions, audit logs) — grounded in the actual stack.

## Architectural Philosophy: Feature-Centric Colocation

Business logic, UI, state, and API calls for a domain live together under `src/features/`.

```
src/features/
├── alerts/
│   ├── components/        # <AlertsOverview />, skeletons
│   ├── hooks/             # useHasAlerts(), useAlerts()
│   ├── api/               # alertsService.ts (stateless API calls)
│   ├── index.ts           # Public API: Components, Hooks, Services
│   └── types.ts           # Local feature types (shared types come from @vivero/shared)
├── users/
├── siembra/               # WIP
├── permissions/
├── entities/
├── auditLogs/
├── extendidos/
├── auth/
└── dashboard/
```

There is **no `src/stores/`** directory and **no Zustand** in use. Use local component state + context providers; keep server state in TanStack Query.

## API Service Pattern (Mandatory)

- Every feature has an `api/` directory with a **stateless service object**.
- All `clientFetch` calls live in these services — hooks never call `clientFetch` directly.
- Method names describe the action: `fetchAll`, `getById`, `update`, `delete`.

```typescript
// features/users/api/userService.ts
export const userService = {
  fetchAll: () => clientFetch<UserDto[]>("users", { method: "GET" }),
  update: (id: string, data: UpdateUserDto) =>
    clientFetch<UserDto>(`users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};
```

## Query Key Management (Mandatory)

- Query keys are defined in `src/lib/queryKeys.ts` (single source of truth).
- Naming: `xxxQueryKeys` (camelCase, plural), typed `as const`.
- Features import from `@/lib/queryKeys` — never define local keys.

## Mutation Invalidation (Mandatory)

- Mutations invalidate via `src/lib/query-invalidation-map.ts`.
- One entry per mutation in `mutationInvalidationMap`; call `invalidateQueries(queryClient, 'mutationName')` in `onSuccess`.
- Cross-feature invalidation goes through the map, never raw key strings.

```typescript
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      toast.success("Usuario eliminado");
      invalidateQueries(queryClient, "deleteUser");
    },
  });
};
```

## Data Fetching & Loading Rules

1. **GET requests use `useSuspenseQuery`** (TanStack Query v5) for declarative Suspense loading.
   - **Exception**: auth-related queries that depend on `isSignedIn` use `useQuery` with `enabled: isSignedIn` (e.g., `use-authUser.ts`, `use-permissions.ts`).
2. **Route-level `loading.tsx`** skeleton for every route segment (Level 1).
3. **In-page `<Suspense>`** wrapping data-fetching components with colocated `*Skeleton.tsx` fallbacks (Level 2).
4. Avoid frequent background polling. `refetchInterval` is a last resort — prefer `staleTime` + refetch on focus/remount (e.g., the alerts header badge uses `staleTime: 5min`, no polling).

## Component Hierarchy

```
src/
├── app/                     # Next.js 16 App Router
│   ├── (dashboard)/         # Protected routes (SidebarProvider + auth guard)
│   ├── (auth)/              # Auth routes
│   ├── manifest.ts          # PWA manifest
│   └── sw.ts                # Serwist service worker
├── features/                # CORE: colocated domain features
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── data-display/        # <DataTable />, charts
│   ├── layout/              # Sidebar, Header, AppShell
│   ├── modals/              # alert-modal-dialog, wizard-modal-dialog
│   ├── common/              # shared bits
│   ├── error/               # error boundaries / not-found
│   └── service-worker/      # PWA registration + update toast
├── lib/
│   ├── api/                 # clientFetch (JWT refresh on 401), error-handler
│   ├── queryKeys.ts         # query key factories
│   ├── query-invalidation-map.ts
│   ├── export/              # CSV, Excel, PDF (pdfmake) — lazy-loaded
│   └── config/              # runtime config
├── constants/               # export-config.ts, routes.ts, site.ts
├── hooks/                   # global hooks (useExportData, etc.)
├── providers/               # AppProviders, alert-modal-provider, wizard-modal-provider
└── types/
```

## Modal Infrastructure (Context + Portal)

- One **provider per modal** (context-only: `open`/`close`/`state`, no dialog JSX).
- The **Dialog shell is mounted once** in the layout; it reads from context via a hook.
- Content components fetch their own data — the provider is a container, not a data fetcher.
- `useAlertModal()` / `useWizard()` hooks throw if used outside their provider.

## CRUD & Table Patterns

- **`SlideOverForm`** is the standard pattern for create/edit forms (slide-over panel).
- **`DataTable`** (`components/data-display/data-table/data-table.tsx`):
  - TanStack Table v8; premium style (`bg-card/40`, `border-border/40`, `shadow-premium`, `rounded-none`).
  - Bulk selection + actions.
  - Permission-aware: `PROCESS` types hide row selection when execution is allowed; `READ_ONLY` hides mutations and selection.
  - Descriptive action labels (e.g., "Asignar Ubicación", not "Ejecutar").
- No FAB; the "Nuevo" button in the DataTable toolbar creates entities.

## Data Export

- Tables support client-side export via the `exportColumns` prop (CSV, Excel, PDF).
- Export columns defined in the feature's `columns.tsx` as `ExportColumn<Dto>[]`; `pdfWidth` required (`"*"` for equal distribution).
- PDF uses lazy-loaded pdfmake + embedded Poppins VFS; logo fetched as base64 at runtime.
- Filenames: `{TableName}_{YYYY-MM-DD}.{ext}`.
- Branding config in `src/constants/export-config.ts`; PDF theme colors in `src/lib/export/pdf-theme.ts` — **keep in sync with `globals.css`**.

## Utilities

- **Date handling**: `getISOWeek` uses Wednesday as the reference day to align with agricultural sowing/planning weeks.

## Authentication & Authorization

- `AuthProfileProvider` context provides `userProfile` (includes `isActive`, `tenantName`).
- `useAuth` hook exposes `login`, `logout`, `user`.
- Permissions validated dynamically against backend `Entity` definitions; `DashboardProtectedLayout` handles loading / DB-unavailable / pending-permissions / authorized states.
- `clientFetch` auto-refreshes JWT on `401` (refresh token flow).

## Shared Contracts

- All data contracts come from **`@vivero/shared`** (Zod schemas + inferred types). Never define API DTO types locally.

## Language

- **Spanish-only UI.** All user-facing strings written directly in Spanish; no i18n framework required.

## Testing

- **Jest 30 + @testing-library/react** for unit/component tests (104 passing across 28 suites).
- No Vitest, no Playwright. Write `*.test.tsx` colocated in `__tests__/` or next to components.

## Quality Gates

- Every route needs `loading.tsx`; every data-fetching component needs a colocated skeleton.
- Respect `prefers-reduced-motion`; use `aria-busy="true"` on skeletons.
- `pnpm --filter frontend lint`, `pnpm --filter frontend type-check`, and `pnpm --filter frontend test` pass.
- Zero-scroll / shrink-to-fit: main views fit within `100dvh` using compact spacing and `ScrollArea` containment.

---

**Mission Statement**: Fast, reliable, Spanish-only interfaces for a small nursery operations team — using the real stack and patterns documented above.
