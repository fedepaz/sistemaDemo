# Alerts V3 Split Dashboard — Design Spec

**Date:** 2026-07-14
**Status:** Approved
**Scope:** Frontend-only. New split-panel UI. Reuses existing hooks and shared DTOs.

## Goal

Present a third visual alternative to the client: a split-panel master-detail dashboard where alerts are listed compactly on the left and full details + actions appear on the right when selected. A fundamentally different interaction model from V1 (tables) and V2 (card grid).

## Architecture

```
Backend (unchanged — 4 GET endpoints, mock data)
      │
      ▼
useAlerts.ts (4 useSuspenseQuery, refetchInterval: 30s)
      │
      ▼
AlertsDashboardV3
  ├── Top bar: total alert count + optional search
  ├── Split layout (grid-cols-[280px_1fr] lg:)
  │   ├── AlertListPanel (left)
  │   │   ├── SeverityGroup("Críticas", criticalAlerts)
  │   │   ├── SeverityGroup("Advertencias", warningAlerts)
  │   │   └── SeverityGroup("Informativas", infoAlerts)
  │   └── AlertDetailPanel (right)
  │       ├── Selected alert full card
  │       ├── Action buttons (reused from V2 card logic)
  │       └── Comment input + history
  └── Mobile: list full-width, detail via Sheet
```

- No new backend endpoints or shared DTOs
- Reuses `useAlerts`, `useAlertActions`, `getSeverity()` helper from V3 bento
- Selected alert state managed by `useState` in AlertsDashboardV3
- Dismissing from detail panel removes item from cache AND clears selection

## Components

### 1. AlertListPanel (left panel)

Compact grouped list. Each severity section:
- **Header:** severity icon + label + count (collapsible)
- **Items:** icon + species code + species name + key stat line
  - Critical: deficit count (red)
  - Warning: days since suggested sowing date / deficit
  - Info: "sin recuento" / "sin pre-expedición"
- Click item → highlights with `bg-accent` + updates selected alert in parent
- Groups collapse/expand independently

### 2. AlertDetailPanel (right panel)

Shows when an alert is selected. Structure:
- **Header:** partida ID + species + severity badge
- **Data grid:** same fields as V2 cards (2-3 columns)
- **Progress bar** for FaltantePlantas (deficit visualization)
- **Action buttons:** same as V2 (dismiss, etc.) via `onDismiss` prop
- **Comment section:** input + history (local state, same as V2 cards)
- **Empty state:** icon + "Seleccioná una alerta para ver sus detalles"

### 3. AlertsDashboardV3 (main)

- Fetches all 4 queries
- Combines and computes severity (reuses `getSeverity()`)
- Manages `selectedAlert: { type, index }` state
- Passes callbacks to both panels
- Split layout: `grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-0`

## Layout & Responsive

| Breakpoint | Layout |
|------------|--------|
| `sm` (<768px) | Full-width list. Tapping an alert opens a Sheet with detail panel. |
| `md` (768-1023px) | 2 columns with collapsed groups. Detail panel on right. |
| `lg` (≥1024px) | Full split: 300px list + 1fr detail. |

## Files

| File | Action |
|------|--------|
| `components/v3/AlertsDashboardV3.tsx` | Rewrite (replaces bento version) |
| `components/v3/alert-list-panel.tsx` | Create — left panel |
| `components/v3/alert-detail-panel.tsx` | Create — right panel |
| `components/v3/severity-filter.tsx` | Delete (replaced by grouped list) |
| `components/v3/bento-alert-wrapper.tsx` | Delete (replaced by split layout) |
| `components/v3/get-severity.ts` | Keep (reused) |
| `app/(dashboard)/alerts/v3/page.tsx` | Keep (unchanged) |
| `app/(dashboard)/alerts/v3/loading.tsx` | Keep (unchanged) |
| `features/alerts/index.ts` | Keep (unchanged) |
