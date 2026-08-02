# Alerts V3 Bento Grid Dashboard — Design Spec

**Date:** 2026-07-14
**Status:** Draft
**Scope:** Frontend-only. New route + 3 new components. Reuses existing hooks and shared DTOs.

## Goal

Present a third visual alternative to the client: a priority-driven bento grid dashboard where alert cards vary in size based on severity. Critical alerts dominate the layout visually without requiring the user to read every card.

## Architecture

```
Backend (unchanged — 4 GET endpoints, mock data from repository)
      │
      ▼
useAlerts.ts (4 useSuspenseQuery, refetchInterval: 30s)
      │
      ▼
AlertsDashboardV3
  ├── SeverityFilter (all | critical | warning | info)
  └── Bento grid
        └── BentoAlertWrapper (severity → col/row span)
              └── {Type}Card (existing card components, same onDismiss actions)
```

- **No new backend endpoints.** No new shared DTOs.
- Reuses `useAlertActions` hook (dismiss + toast).
- Severity is derived client-side via a helper function — not stored in DTOs.

## Severity Mapping

A `getSeverity()` helper determines severity per alert item:

| Severity | Alert Types | Condition |
|----------|-------------|-----------|
| **Critical** | FaltantePlantas | `germinadasTotales < solicitadas * 0.5` (>50% deficit) |
| **Warning** | SiembraRetrasada | Always |
| **Warning** | FaltantePlantas | `germinadasTotales >= solicitadas * 0.5` (≤50% deficit) |
| **Info** | FaltaGerminacion | Always |
| **Info** | FaltaPreExpedicion | Always |

Edge cases:
- If no alerts exist, severity counts show 0 and the grid shows empty state.
- If all alerts are the same severity, the grid still renders consistently (all cards same size — no empty columns).

## Visual Layout

### Grid rules

| Breakpoint | Columns | Critical | Warning | Info |
|------------|---------|----------|---------|------|
| `sm` (<640px) | 1 | full-width | full-width | full-width |
| `md` (640-1023px) | 2 | col-span-2 | col-span-1 | col-span-1 |
| `lg` (≥1024px) | 4 | col-span-2, row-span-2 | col-span-1 | col-span-1 |

### Card sizing by severity

- **Critical:** Large prominent card. Red/rose accent from `--color-faltante`. Shows deficit count prominently at the top. Full set of action buttons.
- **Warning:** Medium card. Warm orange accent from `--color-siembra`. Standard card layout with actions.
- **Info:** Compact card. Blue accent from `--color-germinacion` or `--color-pre-expedicion`. Less inner padding, minimal actions (primary action button only).

Reuses the existing `border-{type}/20 bg-{type}/5 shadow-sm` card styling from V2.

### SeverityFilter

Horizontal row of pill buttons (similar to FilterTabs but with 4 options):

| Tab | Color | Count |
|-----|-------|-------|
| All | Default (primary) | Total |
| Critical | Destructive (red) | Critical count |
| Warning | Warning (amber) | Warning count |
| Info | Info (blue) | Info count |

Active state: filled bg. Inactive: muted with hover transition.

## Components

### 1. `components/v3/severity-filter.tsx` — NEW

Same pattern as `filter-tabs.tsx`:
- `role="tablist"`, `role="tab"`, `aria-selected`
- Props: `activeSeverity`, `onSeverityChange`, `counts: { all, critical, warning, info }`
- Type: `type Severity = "all" | "critical" | "warning" | "info"`
- Mobile: `overflow-x-auto scrollbar-hide` for horizontal scroll (same as FilterTabs)

### 2. `components/v3/bento-alert-wrapper.tsx` — NEW

Props:
```ts
interface BentoAlertWrapperProps {
  severity: "critical" | "warning" | "info";
  order: number; // for staggered animation
  children: ReactNode;
}
```

Applies responsive grid span classes based on severity:
- critical: `col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-2 row-span-1 lg:row-span-2`
- warning: `col-span-1`
- info: `col-span-1`

No visual styling — purely a grid-positioning wrapper. Lets the child card handle its own appearance.

### 3. `components/v3/AlertsDashboardV3.tsx` — NEW

Structure:
1. `AlertsContent()` fetches all 4 queries (same pattern as V2)
2. Computes `getSeverity()` for each alert
3. Combines into a single `renderedAlerts` array with severity metadata
4. Tracks `activeSeverity` state (default: `"all"`)
5. Filters `renderedAlerts` by severity
6. Renders `SeverityFilter` + bento grid
7. Empty state: same "No hay alertas activas" pattern

Action handling: Creates dismiss callbacks via `useAlertActions()` (same as V2). Passes `onDismiss` directly to each child card — BentoAlertWrapper doesn't interfere.

### 4. Card reuse

Existing card components are reused as-is:
- `SiembraRetrasadaCard` → wrapped in BentoAlertWrapper("warning")
- `FaltaGerminacionCard` → wrapped in BentoAlertWrapper("info")
- `FaltantePlantasCard` → wrapped in BentoAlertWrapper with dynamic severity
- `FaltaPreExpedicionCard` → wrapped in BentoAlertWrapper("info")

No changes to card internals needed.

## Route & Loading

New route: `apps/frontend/src/app/(dashboard)/alerts/v3/page.tsx`

```tsx
import { AlertsDashboardV3 } from "@/features/alerts";

export default function AlertsV3Page() {
  return <AlertsDashboardV3 />;
}
```

New loading: `apps/frontend/src/app/(dashboard)/alerts/v3/loading.tsx`

Reuses `AlertDashboardSkeleton` (same skeleton works — grid layout differences are minor for a loading state).

## Barrel export

Add to `features/alerts/index.ts`:
```ts
// v3 Components
export { AlertsDashboardV3 } from "./components/v3/AlertsDashboardV3";
```

## Responsive Behavior

### Mobile (sm:)
- Single column
- All cards same width
- SeverityFilter scrollable horizontally
- Cards stack vertically in severity order (Critical first, then Warning, then Info)

### Tablet (md:)
- 2 columns
- Critical cards span both columns
- SeverityFilter wraps naturally

### Desktop (lg:+)
- 4 columns
- Critical cards span 2 columns × 2 rows
- Warning and Info cards fill remaining space
- Grid reflows gracefully when filtering

### Empty state per severity
- Filter shows "Critical (0)" — grid shows "No hay alertas críticas"
- "All" with 0 total shows the same empty state as V2

## Files to create

| File | Purpose |
|------|---------|
| `components/v3/AlertsDashboardV3.tsx` | Main dashboard |
| `components/v3/severity-filter.tsx` | Severity pill tabs |
| `components/v3/bento-alert-wrapper.tsx` | Grid span wrapper |
| `app/(dashboard)/alerts/v3/page.tsx` | Route page |
| `app/(dashboard)/alerts/v3/loading.tsx` | Route-level skeleton |
| `features/alerts/index.ts` (edit) | Add barrel export |

## What's NOT changing

- Backend (NestJS controller, service, repository)
- Shared DTOs (`@vivero/shared`)
- Existing V1 and V2 components
- Existing hooks (`useAlerts`, `useAlertActions`)
- Existing card components (reused as-is)
- Skeleton component (reused)
- Any CSS variables or design tokens
