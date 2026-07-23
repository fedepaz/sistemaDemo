# Alerts v1/v2 — Interactive Card Dashboard Design

**Date:** 2026-07-13
**Status:** Approved
**Branch:** feat/appweb-alertas

## Goal

Add a second alerts dashboard view (v2) with interactive card-based UI alongside the existing data-table view (v1). Both views share the same backend endpoints and shared DTOs. The client can compare both designs and choose which to keep.

## Navigation

Convert the current standalone "Alertas" nav item to a nested group:

```
Alertas (nestedGroup, Bell icon, requiredPermission: alerts/read)
├── Tablero → /alerts/v1  (current data tables)
└── Interactivo → /alerts/v2  (new interactive cards)
```

## Routing

```
app/(dashboard)/alerts/
├── v1/
│   ├── page.tsx        → <AlertsDashboardV1 />
│   └── loading.tsx     → <AlertDashboardSkeleton />
└── v2/
    ├── page.tsx        → <AlertsDashboardV2 />
    └── loading.tsx     → <AlertDashboardSkeleton />
```

Route constants: `ALERTS_V1: "/alerts/v1"`, `ALERTS_V2: "/alerts/v2"`. Remove old `ALERTS: "/alerts"`.

## Feature Folder Structure

```
features/alerts/
├── api/alertService.ts              # Shared
├── hooks/useAlerts.ts               # Shared
├── components/
│   ├── shared/
│   │   ├── alert-summary-cards.tsx  # Shared (both v1 and v2)
│   │   ├── alert-dashboard-skeleton.tsx
│   │   └── alert-columns.tsx        # v1 columns
│   ├── v1/
│   │   ├── AlertsDashboardV1.tsx    # Current AlertsDashboard renamed
│   │   └── alerts-data-table.tsx
│   └── v2/
│       ├── AlertsDashboardV2.tsx    # New card-based layout
│       ├── SiembraRetrasadaCard.tsx
│       ├── FaltaGerminacionCard.tsx
│       ├── FaltantePlantasCard.tsx
│       ├── FaltaPreExpedicionCard.tsx
│       └── NotificationCenter.tsx
├── index.ts
```

Delete `examplesComponents/` after v2 is complete.

## v2 Card Components

All cards accept shared DTO props directly. No localStorage, no date simulation, no mock data. Actions are visual-only.

### SiembraRetrasadaCard — Props: `SiembraRetrasadaDto`
- Header: `#{partidaId}/{indice}` + `nombreEspecie` + `codigoEspecie`
- Badge: "Siembra retrasada" (warning)
- Fields: `fechaSugeridaSiembra`, `contenedor`, `con`
- Actions: "Sembrada" / "Anular" buttons (visual-only)
- Comment form (local state only)

### FaltaGerminacionCard — Props: `FaltaGerminacionDto`
- Header: same pattern
- Badge: "Esperando recuento" (info)
- Fields: `contenedor`, `invernadero`
- CTA: "Cargar Recuento de Germinacion" → inline form
- Inline form: solicitadas + subpartidas add/remove (local state only)

### FaltantePlantasCard — Props: `FaltantePlantasDto`
- Header: same pattern
- Badge: deficit number (warning)
- Stats grid: `solicitadas` / `germinadasTotales` / percentage
- Progress bar
- Comments section (visual-only)
- Role-gated: "Intervenir y Resolver" for supervisor only (visual-only)

### FaltaPreExpedicionCard — Props: `FaltaPreExpedicionDto`
- Header: same pattern
- Badge: "Pre-expedicion faltante" (info)
- Fields: `fechaEntrega`, `invernadero`
- CTA: "Cargar Datos de Pre-expedicion" (visual-only)

### NotificationCenter
- Bell icon with pulsing dot
- Notification list (audit trail)
- "Limpiar todo" button (local state only)

## AlertsDashboardV2 Layout

```
┌─────────────────────────────────────────────┐
│  Summary Cards (4 cards, shared component)  │
├───────────────────────────┬─────────────────┤
│  Alert Cards (scrollable) │ Notification    │
│  ┌─────────────────────┐  │ Center          │
│  │ SiembraRetrasadaCard│  │ (fixed panel)   │
│  ├─────────────────────┤  │                 │
│  │ FaltaGerminacionCard│  │                 │
│  ├─────────────────────┤  │                 │
│  │ FaltantePlantasCard │  │                 │
│  ├─────────────────────┤  │                 │
│  │ FaltaPreExpedicion  │  │                 │
│  └─────────────────────┘  │                 │
└───────────────────────────┴─────────────────┘
```

Two-column layout: cards on left (scrollable), NotificationCenter on right (fixed panel). Summary cards at top (shared component).

## Backend

No changes. Both v1 and v2 use the same 4 GET endpoints:
- `GET l-alerts/siembra-retrasada`
- `GET l-alerts/falta-germinacion`
- `GET l-alerts/faltante-plantas`
- `GET l-alerts/falta-pre-expedicion`

## Verification

1. `pnpm lint` — 0 new errors
2. `pnpm build` — both `/alerts/v1` and `/alerts/v2` routes compile
3. Navigation: nested group with both sub-items renders correctly
4. v1: same behavior as before (data tables)
5. v2: cards render with real data from shared hooks, buttons are visual-only
