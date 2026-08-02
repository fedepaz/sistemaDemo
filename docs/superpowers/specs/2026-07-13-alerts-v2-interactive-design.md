# Alerts V2 Interactive Dashboard — Design Spec

**Date:** 2026-07-13
**Status:** Approved
**Scope:** Frontend-only changes (no backend mutations)

## Goal

Transform the alerts v2 interactive dashboard from a read-only display into a functional filtering + dismiss system. Users fetch all alerts, filter by type on the frontend, and dismiss alerts via React Query cache updates. Toast notifications provide feedback via hooks (sonner pattern).

## Architecture

```
Backend (unchanged — 4 GET endpoints, mock data)
      │
      ▼
useAlerts.ts (4 useSuspenseQuery, refetchInterval: 30s)
      │
      ▼
AlertsDashboardV2
  ├── AlertSummaryCards (4 counts)
  ├── FilterTabs (all | siembra | germinacion | faltante | pre-expedicion)
  ├── Cards grid (filtered by activeTab)
  │     ├── SiembraRetrasadaCard    ← onDismiss("sembrada"|"anulada")
  │     ├── FaltaGerminacionCard    ← onDismiss("registrado")
  │     ├── FaltantePlantasCard     ← onDismiss("intervenido")
  │     └── FaltaPreExpedicionCard  ← onDismiss("cargada")
  └── NotificationCenter (local state, unchanged)
```

## Key Decisions

- **Filtering:** Client-side — all 4 queries fire on mount, frontend filters by `activeTab`
- **Dismiss:** `queryClient.setQueryData()` removes item from cache — alert reappears on next refetch (30s)
- **Toast:** Called in hooks via `sonner` — follows existing app pattern (`useSiembraPartidaMutation`, `useEntities`)
- **No backend changes** — all GET endpoints unchanged
- **Comments:** Stay local (no persistence)
- **NotificationCenter:** Keep as-is (local state)
- **No date simulation, no role switching, no CRUD form**

## Components

### 1. FilterTabs (new shared component)

**Location:** `components/shared/filter-tabs.tsx`

**Props:**
```ts
interface FilterTabsProps {
  activeTab: AlertTab;
  onTabChange: (tab: AlertTab) => void;
  counts: {
    all: number;
    siembra: number;
    germinacion: number;
    faltante: number;
    preExpedicion: number;
  };
}

type AlertTab = "all" | "siembra" | "germinacion" | "faltante" | "pre-expedicion";
```

**Design:**
- Horizontal row of pill buttons
- Each: icon + label + count badge
- Active: filled bg with type color (orange/blue/rose/purple)
- Inactive: muted with hover
- "Todas" = total count, `bg-primary` active state

### 2. useAlertActions hook (new)

**Location:** `hooks/useAlertActions.ts`

**Pattern:** Each action is a function that:
1. Updates React Query cache via `setQueryData` (removes item)
2. Shows toast via `sonner`

```ts
export function useAlertActions() {
  const queryClient = useQueryClient();

  const dismissSiembra = (partidaId: number, indice: number, action: "sembrada" | "anulada") => {
    queryClient.setQueryData<SiembraRetrasadaDto[]>(
      alertsQueryKeys.byType("siembra-retrasada"),
      (old) => old?.filter((a) => !(a.partidaId === partidaId && a.indice === indice)) ?? []
    );
    toast.success(action === "sembrada"
      ? "Partida marcada como sembrada"
      : "Partida anulada", { duration: 3000 });
  };

  // Similar for germinacion, faltante, preExpedicion
}
```

### 3. Card changes

Each card receives an `onDismiss` prop and calls it on action:

| Card | Button | Handler |
|------|--------|---------|
| SiembraRetrasadaCard | "Sembrada" | `onDismiss("sembrada")` |
| SiembraRetrasadaCard | "Anular" | `onDismiss("anulada")` |
| FaltaGerminacionCard | Submit form | `onDismiss("registrado")` |
| FaltantePlantasCard | "Intervenir y Resolver" | `onDismiss("intervenido")` |
| FaltaPreExpedicionCard | "Cargar Datos" | `onDismiss("cargada")` |

### 4. AlertsDashboardV2 changes

- Add `activeTab` state (default: `"all"`)
- Filter data by tab before rendering
- Create `handleDismiss` callbacks using `useAlertActions`
- Pass `onDismiss` to each card
- Enhanced empty state per tab

### 5. useAlerts changes

- Add `refetchInterval: 30_000` for background refresh

## Files to change

| File | Change |
|------|--------|
| `components/shared/filter-tabs.tsx` | **NEW** — FilterTabs component |
| `hooks/useAlertActions.ts` | **NEW** — dismiss handlers + toast |
| `hooks/useAlerts.ts` | Add `refetchInterval: 30_000` |
| `components/v2/AlertsDashboardV2.tsx` | Add tabs, filtering, action handlers |
| `components/v2/SiembraRetrasadaCard.tsx` | Add `onDismiss` prop, wire buttons |
| `components/v2/FaltaGerminacionCard.tsx` | Add `onDismiss` prop, wire submit |
| `components/v2/FaltantePlantasCard.tsx` | Add `onDismiss` prop, wire resolve |
| `components/v2/FaltaPreExpedicionCard.tsx` | Add `onDismiss` prop, wire button |
| `index.ts` | Export FilterTabs |
