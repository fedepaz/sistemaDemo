# Alerts V3 Bento Grid Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a priority-driven bento grid dashboard (V3) as a third visual alternative alongside V1 and V2.

**Architecture:** Frontend-only. New `components/v3/` folder with 3 components. Reuses existing `useAlerts` hooks, `useAlertActions` hook, and shared DTOs. Severity derived client-side via a helper function. Cards are existing V2 card components wrapped in a grid-span positioning wrapper.

**Tech Stack:** Next.js 15 App Router, shadcn/ui, Tailwind v4, TanStack Query, Lucide React

## Global Constraints

- No new backend endpoints or shared DTOs
- All UI text in Spanish
- Use existing OKLCH CSS theme tokens only (no new colors)
- Follow existing card styling pattern: `border-{type}/20 bg-{type}/5 shadow-sm`
- Follow existing accessibility patterns: `role="tablist"`, `aria-selected`, `aria-label`
- Reuse `AlertDashboardSkeleton` for loading state
- All files colocated under `features/alerts/components/v3/`
- Route: `app/(dashboard)/alerts/v3/`

---

### Task 1: Create SeverityFilter component

**Files:**
- Create: `apps/frontend/src/features/alerts/components/v3/severity-filter.tsx`
- Test: Manual visual check (no existing test pattern for filter components)

**Interfaces:**
- Consumes: SeverityFilterProps interface
- Produces: `SeverityFilter` component + `Severity` type

**Step 1: Create `severity-filter.tsx`**

```tsx
"use client";

import { AlertTriangle, AlertCircle, Info, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export type Severity = "all" | "critical" | "warning" | "info";

interface SeverityFilterProps {
  activeSeverity: Severity;
  onSeverityChange: (severity: Severity) => void;
  counts: {
    all: number;
    critical: number;
    warning: number;
    info: number;
  };
}

const SEVERITY_TABS: {
  key: Severity;
  label: string;
  icon: typeof AlertTriangle;
  activeClass: string;
  hoverClass: string;
}[] = [
  {
    key: "all",
    label: "Todas",
    icon: LayoutGrid,
    activeClass: "bg-primary text-primary-foreground border-primary shadow-sm",
    hoverClass: "hover:bg-muted hover:text-foreground",
  },
  {
    key: "critical",
    label: "Críticas",
    icon: AlertCircle,
    activeClass: "bg-destructive text-destructive-foreground border-destructive shadow-sm",
    hoverClass: "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40",
  },
  {
    key: "warning",
    label: "Advertencias",
    icon: AlertTriangle,
    activeClass: "bg-warning text-warning-foreground border-warning shadow-sm",
    hoverClass: "hover:bg-warning/10 hover:text-warning hover:border-warning/40",
  },
  {
    key: "info",
    label: "Informativas",
    icon: Info,
    activeClass: "bg-info text-info-foreground border-info shadow-sm",
    hoverClass: "hover:bg-info/10 hover:text-info hover:border-info/40",
  },
];

export function SeverityFilter({ activeSeverity, onSeverityChange, counts }: SeverityFilterProps) {
  return (
    <div
      className="flex flex-nowrap sm:flex-wrap gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide"
      role="tablist"
      aria-label="Filtrar alertas por severidad"
    >
      {SEVERITY_TABS.map((tab) => {
        const isActive = activeSeverity === tab.key;
        const count = counts[tab.key];

        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSeverityChange(tab.key)}
            className={cn(
              "px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all border cursor-pointer whitespace-nowrap",
              isActive
                ? tab.activeClass
                : cn("bg-background border-border text-muted-foreground", tab.hoverClass)
            )}
          >
            <span
              className={cn(
                "min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[11px] font-mono font-extrabold px-1",
                isActive
                  ? "bg-white/20 text-white"
                  : count > 0
                    ? "bg-muted text-muted-foreground"
                    : "bg-muted/50 text-muted-foreground/50"
              )}
            >
              {count}
            </span>
            <tab.icon className="h-3.5 w-3.5 shrink-0" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify file compiles**

Run: `pnpm lint`
Expected: No errors in severity-filter.tsx

---

### Task 2: Create getSeverity helper

**Files:**
- Create: `apps/frontend/src/features/alerts/components/v3/get-severity.ts`

**Interfaces:**
- Consumes: SiembraRetrasadaDto, FaltaGerminacionDto, FaltantePlantasDto, FaltaPreExpedicionDto from `@vivero/shared`
- Produces: `getSeverity()` function, `SeverityLevel` type

**Step 1: Create `get-severity.ts`**

```ts
import type {
  SiembraRetrasadaDto,
  FaltaGerminacionDto,
  FaltantePlantasDto,
  FaltaPreExpedicionDto,
} from "@vivero/shared";

export type SeverityLevel = "critical" | "warning" | "info";

export function getSeverity(
  alert: SiembraRetrasadaDto | FaltaGerminacionDto | FaltantePlantasDto | FaltaPreExpedicionDto,
): SeverityLevel {
  if ("germinadasTotales" in alert && "solicitadas" in alert) {
    const deficit = alert.solicitadas - alert.germinadasTotales;
    const deficitRatio = deficit / alert.solicitadas;
    return deficitRatio > 0.5 ? "critical" : "warning";
  }

  if ("fechaSugeridaSiembra" in alert) {
    return "warning";
  }

  return "info";
}
```

- [ ] **Step 2: Verify file compiles**

Run: `pnpm lint`
Expected: No errors

---

### Task 3: Create BentoAlertWrapper component

**Files:**
- Create: `apps/frontend/src/features/alerts/components/v3/bento-alert-wrapper.tsx`

**Interfaces:**
- Consumes: `BentoAlertWrapperProps` (`severity: SeverityLevel`, `children: ReactNode`)
- Produces: `BentoAlertWrapper` component

**Step 1: Create `bento-alert-wrapper.tsx`**

```tsx
"use client";

import type { ReactNode } from "react";
import { type SeverityLevel } from "./get-severity";

interface BentoAlertWrapperProps {
  severity: SeverityLevel;
  children: ReactNode;
}

const SPAN_CLASSES: Record<SeverityLevel, string> = {
  critical:
    "col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-2",
  warning: "col-span-1",
  info: "col-span-1",
};

export function BentoAlertWrapper({ severity, children }: BentoAlertWrapperProps) {
  return (
    <div className={SPAN_CLASSES[severity]}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Verify file compiles**

Run: `pnpm lint`
Expected: No errors

---

### Task 4: Create AlertsDashboardV3 component

**Files:**
- Create: `apps/frontend/src/features/alerts/components/v3/AlertsDashboardV3.tsx`

**Interfaces:**
- Consumes: all hooks and components from previous tasks, `useAlertActions`, card components
- Produces: `AlertsDashboardV3` component (exports from index.ts)

**Step 1: Create `AlertsDashboardV3.tsx`**

```tsx
"use client";

import { Suspense, useState, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { AlertDashboardSkeleton } from "../shared/alert-dashboard-skeleton";
import { SeverityFilter, type Severity } from "./severity-filter";
import { BentoAlertWrapper } from "./bento-alert-wrapper";
import { getSeverity, type SeverityLevel } from "./get-severity";
import {
  useSiembraRetrasada,
  useFaltaGerminacion,
  useFaltantePlantas,
  useFaltaPreExpedicion,
} from "../../hooks/useAlerts";
import { useAlertActions } from "../../hooks/useAlertActions";
import { SiembraRetrasadaCard } from "../v2/SiembraRetrasadaCard";
import { FaltaGerminacionCard } from "../v2/FaltaGerminacionCard";
import { FaltantePlantasCard } from "../v2/FaltantePlantasCard";
import { FaltaPreExpedicionCard } from "../v2/FaltaPreExpedicionCard";

interface RenderedAlert {
  id: string;
  severity: SeverityLevel;
  type: "siembra" | "germinacion" | "faltante" | "pre-expedicion";
  component: React.ReactNode;
}

function AlertsContent() {
  const { data: siembraRetrasada } = useSiembraRetrasada();
  const { data: faltaGerminacion } = useFaltaGerminacion();
  const { data: faltantePlantas } = useFaltantePlantas();
  const { data: faltaPreExpedicion } = useFaltaPreExpedicion();

  const [activeSeverity, setActiveSeverity] = useState<Severity>("all");
  const actions = useAlertActions();

  const allAlerts: RenderedAlert[] = useMemo(() => {
    const alerts: RenderedAlert[] = [];

    siembraRetrasada.forEach((a) => {
      alerts.push({
        id: `siembra-${a.partidaId}-${a.indice}`,
        severity: getSeverity(a),
        type: "siembra",
        component: (
          <SiembraRetrasadaCard
            alerta={a}
            onDismiss={(action) => actions.dismissSiembra(a.partidaId, a.indice, action)}
          />
        ),
      });
    });

    faltaGerminacion.forEach((a) => {
      alerts.push({
        id: `germinacion-${a.partidaId}-${a.indice}`,
        severity: getSeverity(a),
        type: "germinacion",
        component: (
          <FaltaGerminacionCard
            alerta={a}
            onDismiss={() => actions.dismissGerminacion(a.partidaId, a.indice)}
          />
        ),
      });
    });

    faltantePlantas.forEach((a) => {
      alerts.push({
        id: `faltante-${a.partidaId}-${a.indice}`,
        severity: getSeverity(a),
        type: "faltante",
        component: (
          <FaltantePlantasCard
            alerta={a}
            onDismiss={() => actions.dismissFaltante(a.partidaId, a.indice)}
          />
        ),
      });
    });

    faltaPreExpedicion.forEach((a) => {
      alerts.push({
        id: `pre-expedicion-${a.partidaId}-${a.indice}`,
        severity: getSeverity(a),
        type: "pre-expedicion",
        component: (
          <FaltaPreExpedicionCard
            alerta={a}
            onDismiss={() => actions.dismissPreExpedicion(a.partidaId, a.indice)}
          />
        ),
      });
    });

    return alerts;
  }, [siembraRetrasada, faltaGerminacion, faltantePlantas, faltaPreExpedicion, actions]);

  const severityCounts = useMemo(() => {
    const counts = { all: allAlerts.length, critical: 0, warning: 0, info: 0 };
    allAlerts.forEach((a) => counts[a.severity]++);
    return counts;
  }, [allAlerts]);

  const filteredAlerts = useMemo(() => {
    if (activeSeverity === "all") return allAlerts;
    return allAlerts.filter((a) => a.severity === activeSeverity);
  }, [allAlerts, activeSeverity]);

  const totalAlerts = allAlerts.length;
  const showFilter = totalAlerts > 0;

  return (
    <div className="flex flex-col gap-4">
      {showFilter && (
        <SeverityFilter
          activeSeverity={activeSeverity}
          onSeverityChange={setActiveSeverity}
          counts={severityCounts}
        />
      )}

      {totalAlerts === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="p-3 rounded-full bg-muted">
            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">No hay alertas activas</p>
            <p className="text-xs text-muted-foreground mt-1">
              Todas las partidas están dentro de los parámetros esperados
            </p>
          </div>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="p-3 rounded-full bg-muted">
            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">No hay alertas de este tipo</p>
            <p className="text-xs text-muted-foreground mt-1">
              No se encontraron alertas para la severidad seleccionada
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto">
          {filteredAlerts.map((alert) => (
            <BentoAlertWrapper key={alert.id} severity={alert.severity}>
              {alert.component}
            </BentoAlertWrapper>
          ))}
        </div>
      )}
    </div>
  );
}

export function AlertsDashboardV3() {
  return (
    <Suspense fallback={<AlertDashboardSkeleton />}>
      <AlertsContent />
    </Suspense>
  );
}
```

- [ ] **Step 2: Verify file compiles**

Run: `pnpm lint`
Expected: No errors

---

### Task 5: Create route page and loading file

**Files:**
- Create: `apps/frontend/src/app/(dashboard)/alerts/v3/page.tsx`
- Create: `apps/frontend/src/app/(dashboard)/alerts/v3/loading.tsx`

**Step 1: Create `page.tsx`**

```tsx
import { AlertsDashboardV3 } from "@/features/alerts";

export const dynamic = "force-dynamic";

export default function AlertsV3Page() {
  return <AlertsDashboardV3 />;
}
```

**Step 2: Create `loading.tsx`**

```tsx
import { AlertDashboardSkeleton } from "@/features/alerts";

export default function Loading() {
  return <AlertDashboardSkeleton />;
}
```

- [ ] **Step 3: Verify both files compile**

Run: `pnpm lint`
Expected: No errors

---

### Task 6: Add barrel exports

**Files:**
- Modify: `apps/frontend/src/features/alerts/index.ts`

**Step 1: Add v3 export to `index.ts`**

```ts
// v3 Components
export { AlertsDashboardV3 } from "./components/v3/AlertsDashboardV3";
```

Add after the v2 Components section (around line 13).

- [ ] **Step 2: Verify export works**

Run: `pnpm lint`
Expected: No errors

---

### Task 7: Final verification

- [ ] **Step 1: Lint entire project**

Run: `pnpm lint`
Expected: 0 errors (pre-existing warnings only)

- [ ] **Step 2: Type-check frontend**

Run: `cd apps/frontend && npx tsc --noEmit`
Expected: No errors in new files (pre-existing vitest type errors in test files only)

- [ ] **Step 3: Verify route renders**

Run dev server: `pnpm dev`
Expected: Navigating to `/alerts/v3` shows the bento grid dashboard with SeverityFilter and cards
