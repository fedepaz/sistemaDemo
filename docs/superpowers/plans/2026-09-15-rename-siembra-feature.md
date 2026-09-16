# Rename Siembra Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename `features/siembra/` to `features/programacionSiembra/`, rename page route, and update all component names, imports, and API paths.

**Architecture:** Direct refactoring — rename directories/files via `git mv`, then update all import paths and identifiers across the codebase. No logic changes.

**Tech Stack:** Next.js 16 (App Router), TypeScript, React, TanStack Query

## Global Constraints

- No database migrations
- No git commits — just file changes
- `features/siembraPartidas/` directory stays unchanged
- Keep user-facing Spanish toast messages unchanged
- Keep internal HTML form IDs unchanged (`autorizar-siembra-form`, `siembra-partidas-registradas-form`)
- Keep `accessorKey: "sem_siembra"` as-is (DB column name)

---

## File Structure

### Files to Rename
| Original Path | New Path |
|---|---|
| `apps/frontend/src/features/siembra/` | `apps/frontend/src/features/programacionSiembra/` |
| `apps/frontend/src/app/(dashboard)/siembra/` | `apps/frontend/src/app/(dashboard)/programacion-siembra/` |
| `api/siembraService.ts` | `api/programacionSiembraService.ts` |
| `hooks/useSiembraPartidas.ts` | `hooks/useProgramacionSiembraPartidas.ts` |
| `hooks/useSiembraPartidaMutation.ts` | `hooks/useProgramacionSiembraPartidaMutation.ts` |
| `components/SiembraDashboard.tsx` | `components/ProgramacionSiembraDashboard.tsx` |
| `components/siembra-dashboard-skeleton.tsx` | `components/programacionSiembra-dashboard-skeleton.tsx` |
| `components/siembra-view.tsx` | `components/programacionSiembra-view.tsx` |
| `components/siembra-view-form.tsx` | `components/programacionSiembra-view-form.tsx` |
| `components/siembra-data-table.tsx` | `components/programacionSiembra-data-table.tsx` |
| `components/autorizar-siembra-edit-form.tsx` | `components/autorizar-programacionSiembra-edit-form.tsx` |

### Files to Modify (content only)
- `apps/frontend/src/features/programacionSiembra/index.ts`
- `apps/frontend/src/features/programacionSiembra/api/programacionSiembraService.ts`
- `apps/frontend/src/features/programacionSiembra/hooks/useProgramacionSiembraPartidas.ts`
- `apps/frontend/src/features/programacionSiembra/hooks/useProgramacionSiembraPartidaMutation.ts`
- `apps/frontend/src/features/programacionSiembra/components/ProgramacionSiembraDashboard.tsx`
- `apps/frontend/src/features/programacionSiembra/components/programacionSiembra-dashboard-skeleton.tsx`
- `apps/frontend/src/features/programacionSiembra/components/programacionSiembra-view.tsx`
- `apps/frontend/src/features/programacionSiembra/components/programacionSiembra-view-form.tsx`
- `apps/frontend/src/features/programacionSiembra/components/programacionSiembra-data-table.tsx`
- `apps/frontend/src/features/programacionSiembra/components/autorizar-programacionSiembra-edit-form.tsx`
- `apps/frontend/src/features/programacionSiembra/components/columns.tsx`
- `apps/frontend/src/app/(dashboard)/programacion-siembra/page.tsx`

---

### Task 1: Rename directories and files via git mv

**Files:**
- Rename: `apps/frontend/src/features/siembra/` → `apps/frontend/src/features/programacionSiembra/`
- Rename: `apps/frontend/src/app/(dashboard)/siembra/` → `apps/frontend/src/app/(dashboard)/programacion-siembra/`

**Steps:**

- [ ] **Step 1: Rename feature directory**

```bash
git mv apps/frontend/src/features/siembra apps/frontend/src/features/programacionSiembra
```

- [ ] **Step 2: Rename route directory**

```bash
git mv "apps/frontend/src/app/(dashboard)/siembra" "apps/frontend/src/app/(dashboard)/programacion-siembra"
```

- [ ] **Step 3: Rename files inside feature directory**

```bash
cd apps/frontend/src/features/programacionSiembra

git mv api/siembraService.ts api/programacionSiembraService.ts
git mv hooks/useSiembraPartidas.ts hooks/useProgramacionSiembraPartidas.ts
git mv hooks/useSiembraPartidaMutation.ts hooks/useProgramacionSiembraPartidaMutation.ts
git mv components/SiembraDashboard.tsx components/ProgramacionSiembraDashboard.tsx
git mv components/siembra-dashboard-skeleton.tsx components/programacionSiembra-dashboard-skeleton.tsx
git mv components/siembra-view.tsx components/programacionSiembra-view.tsx
git mv components/siembra-view-form.tsx components/programacionSiembra-view-form.tsx
git mv components/siembra-data-table.tsx components/programacionSiembra-data-table.tsx
git mv components/autorizar-siembra-edit-form.tsx components/autorizar-programacionSiembra-edit-form.tsx
```

- [ ] **Step 4: Verify renames**

Run: `find apps/frontend/src/features/programacionSiembra -type f | sort`
Expected: All files show new names

---

### Task 2: Update index.ts exports

**Files:**
- Modify: `apps/frontend/src/features/programacionSiembra/index.ts`

**Steps:**

- [ ] **Step 1: Update index.ts**

```typescript
// src/features/programacionSiembra/index.ts

// Components
export { ProgramacionSiembraDashboard } from "./components/ProgramacionSiembraDashboard";
export { ProgramacionSiembraDashboardSkeleton } from "./components/programacionSiembra-dashboard-skeleton";

// Hooks
export { useProgramacionSiembraPartidas } from "./hooks/useProgramacionSiembraPartidas";

// Services
export { programacionSiembraService } from "./api/programacionSiembraService";
```

---

### Task 3: Update API service

**Files:**
- Modify: `apps/frontend/src/features/programacionSiembra/api/programacionSiembraService.ts`

**Steps:**

- [ ] **Step 1: Update API service**

```typescript
// src/features/programacionSiembra/api/programacionSiembraService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import {
  AsignarUbiSiembraCompletaDto,
  AutorizarSiembraDto,
  LegacySustratoDto,
  ProgramacionSiembraDto,
  SiembraPartidaDto,
  TratamientoDto,
} from "@vivero/shared";

export const programacionSiembraService = {
  fetchAll: () => {
    return clientFetch<ProgramacionSiembraDto[]>("l-programacion-siembra", { method: "GET" });
  },

  asignarUbicacionSiembra: (data: AsignarUbiSiembraCompletaDto) => {
    return clientFetch<void>("l-partidas/asignar-siembra", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  autorizarSiembra: (data: AutorizarSiembraDto) => {
    return clientFetch<SiembraPartidaDto>("l-partidas/autorizar-siembra", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  fetchTratamientos: () => {
    return clientFetch<TratamientoDto[]>("l-tratamiento", { method: "GET" });
  },

  fetchLegacySustratos: () => {
    return clientFetch<LegacySustratoDto[]>("l-sustrato", { method: "GET" });
  },
};
```

---

### Task 4: Update hooks

**Files:**
- Modify: `apps/frontend/src/features/programacionSiembra/hooks/useProgramacionSiembraPartidas.ts`
- Modify: `apps/frontend/src/features/programacionSiembra/hooks/useProgramacionSiembraPartidaMutation.ts`

**Steps:**

- [ ] **Step 1: Update useProgramacionSiembraPartidas.ts**

```typescript
// apps/frontend/src/features/programacionSiembra/hooks/useProgramacionSiembraPartidas.ts
"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { ProgramacionSiembraDto } from "@vivero/shared";
import { programacionSiembraService } from "../api/programacionSiembraService";
import { programacionSiembraQueryKeys } from "@/lib/queryKeys";

/**
 * Hook to manage extendidos data.
 * Always fetches records "in chamber" and applies local filtering by camaraId.
 */

export function useProgramacionSiembraPartidas() {
  return useSuspenseQuery<ProgramacionSiembraDto[]>({
    queryKey: programacionSiembraQueryKeys.partidas(),
    queryFn: programacionSiembraService.fetchAll,
  });
}
```

- [ ] **Step 2: Update useProgramacionSiembraPartidaMutation.ts**

```typescript
// apps/frontend/src/features/programacionSiembra/hooks/useProgramacionSiembraPartidaMutation.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { invalidateQueries } from "@/lib/query-invalidation-map";
import { programacionSiembraService } from "../api/programacionSiembraService";

export const useProgramacionSiembraAutorizacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: programacionSiembraService.autorizarSiembra,
    onSuccess: () => {
      invalidateQueries(queryClient, "siembraPartida");
      toast.success("Partida autorizada para siembra", { duration: 3000 });
    },
  });
};
```

---

### Task 5: Update components

**Files:**
- Modify: `apps/frontend/src/features/programacionSiembra/components/ProgramacionSiembraDashboard.tsx`
- Modify: `apps/frontend/src/features/programacionSiembra/components/programacionSiembra-dashboard-skeleton.tsx`
- Modify: `apps/frontend/src/features/programacionSiembra/components/programacionSiembra-view.tsx`
- Modify: `apps/frontend/src/features/programacionSiembra/components/programacionSiembra-view-form.tsx`
- Modify: `apps/frontend/src/features/programacionSiembra/components/programacionSiembra-data-table.tsx`
- Modify: `apps/frontend/src/features/programacionSiembra/components/autorizar-programacionSiembra-edit-form.tsx`
- Modify: `apps/frontend/src/features/programacionSiembra/components/columns.tsx`

**Steps:**

- [ ] **Step 1: Update ProgramacionSiembraDashboard.tsx**

```typescript
// src/features/programacionSiembra/components/ProgramacionSiembraDashboard.tsx

import { ProgramacionSiembraView } from "./programacionSiembra-view";

export function ProgramacionSiembraDashboard() {
  return <ProgramacionSiembraView />;
}
```

- [ ] **Step 2: Update programacionSiembra-dashboard-skeleton.tsx**

```typescript
// src/features/programacionSiembra/components/programacionSiembra-dashboard-skeleton.tsx
"use client";

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { partidaSiembraColumns } from "./columns";

function ProgramacionSiembraToolbarSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
      <Skeleton className="h-3 w-3 rounded-full" />
      <Skeleton className="h-8 rounded-full w-[140px]" />
    </div>
  );
}

export function ProgramacionSiembraDashboardSkeleton() {
  return (
    <div className="space-y-4">
      <DataTableSkeleton
        columnCount={partidaSiembraColumns.length}
        toolbarContent={<ProgramacionSiembraToolbarSkeleton />}
      />
    </div>
  );
}
```

- [ ] **Step 3: Update programacionSiembra-view.tsx**

```typescript
// src/features/programacionSiembra/components/programacionSiembra-view.tsx
"use client";

import { useMemo } from "react";
import { EmptyState } from "./empty-state";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { partidaSiembraColumns } from "./columns";

import { ProgramacionSiembraDataTable } from "./programacionSiembra-data-table";
import { useProgramacionSiembraPartidas } from "../hooks/useProgramacionSiembraPartidas";
import { useASembrarPartidas } from "@/features/aSembrar/hooks/useASembrarPartidas";
import { useSiembraPartidasRegistradas } from "@/features/siembraPartidas/hooks/useSiembraPartidasRegistradas";
import { LoadingBoundary } from "@/components/common/loading-boundary";

function ProgramacionSiembraList({ camaraId }: { camaraId: string }) {
  const { data: siembraPartidas, isFetching } = useProgramacionSiembraPartidas();
  const { data: aSembrarPartidas } = useASembrarPartidas();
  const { data: registradasPartidas } = useSiembraPartidasRegistradas();

  const aSembrarKeys = useMemo(
    () =>
      new Set(
        (aSembrarPartidas || []).map(
          (p) => `${p.partidaId}-${p.anio}-${p.indice}`,
        ),
      ),
    [aSembrarPartidas],
  );

  const registradasKeys = useMemo(
    () =>
      new Set(
        (registradasPartidas || []).map(
          (p) => `${p.partidaId}-${p.anio}-${p.indice}`,
        ),
      ),
    [registradasPartidas],
  );

  const columns = useMemo(
    () => partidaSiembraColumns(aSembrarKeys, registradasKeys),
    [aSembrarKeys, registradasKeys],
  );

  const hasData = siembraPartidas && siembraPartidas.length > 0;

  if (!hasData && !isFetching && camaraId === "all") {
    return (
      <EmptyState
        title="Sin registros"
        description="No hay registros de extendidos en cámara actualmente."
      />
    );
  }

  return (
    <ProgramacionSiembraDataTable
      partidas={siembraPartidas || []}
      columns={columns}
      aSembrarKeys={aSembrarKeys}
      registradasKeys={registradasKeys}
    />
  );
}

export function ProgramacionSiembraView() {
  return (
    <div className="space-y-2">
      <LoadingBoundary
        skeleton={
          <DataTableSkeleton
            columnCount={12}
            toolbarContent={
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-8 rounded-full w-[140px]" />
              </div>
            }
          />
        }
      >
        <ProgramacionSiembraList camaraId="all" />
      </LoadingBoundary>
    </div>
  );
}
```

- [ ] **Step 4: Update programacionSiembra-view-form.tsx**

```typescript
// src/features/programacionSiembra/components/programacionSiembra-view-form.tsx

import { Card, CardContent } from "@/components/ui/card";
import { ProgramacionSiembraDto } from "@vivero/shared";
import {
  Package,
  Calendar,
  Info,
  Hash,
  Activity,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/lib/date-utils";

interface ProgramacionSiembraFormProps {
  selectedExtendido: ProgramacionSiembraDto;
}

const InfoRow = ({
  icon: Icon,
  label,
  value,
  className,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  value?: string | number | null;
  className?: string;
}) => (
  <div
    className={cn(
      "flex items-center gap-3 md:gap-4 py-2 md:py-3 border-b border-border/40 last:border-0",
      className,
    )}
  >
    <div className="p-1.5 md:p-2 bg-primary/5 rounded-lg border border-primary/10">
      <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none mb-1 md:mb-1.5">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <p className="text-xs md:text-base font-bold truncate text-foreground">
          {value ?? "-"}
        </p>
      </div>
    </div>
  </div>
);

export function ProgramacionSiembraViewForm({ selectedExtendido }: ProgramacionSiembraFormProps) {
  return (
    <div className="flex flex-col gap-3 md:gap-6 animate-in fade-in duration-500 h-full max-h-[calc(100dvh-130px)] md:max-h-[calc(100dvh-140px)] overflow-hidden">
      {/* FIXED TOP SECTION: PRODUCTO (Always Visible) */}
      <div className="space-y-3 md:space-y-4 shrink-0">
        <div className="flex items-center justify-between bg-primary/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-primary/20 shadow-sm">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Package className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-black tracking-tight leading-none text-foreground uppercase">
                {selectedExtendido.codigoEspecie}
              </h2>
              <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 md:mt-1.5">
                {selectedExtendido.nombreEspecie}
              </p>
            </div>
          </div>
        </div>

        {/* BASIC SPECS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { label: "Año", value: selectedExtendido.anio, icon: Calendar },
            { label: "Índice", value: selectedExtendido.indice, icon: Hash },

            { label: "CANT", value: selectedExtendido.nrocont, icon: Activity },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-background border border-border/60 p-1.5 md:p-2.5 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2.5 shadow-sm overflow-hidden"
            >
              <div className="p-1 md:p-1.5 bg-muted rounded-md shrink-0">
                <item.icon className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[7px] md:text-[8px] font-bold uppercase leading-none mb-0.5">
                  {item.label}
                </p>
                <p className="text-[10px] md:text-xs truncate uppercase font-bold">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DATA CONTENT */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-2">
        <Card className="border-border/60 shadow-sm rounded-xl md:rounded-[1.5rem] overflow-hidden bg-card/50">
          <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
            <InfoRow
              icon={ClipboardList}
              label="Semilla"
              value={selectedExtendido.propiedad}
              className="border-primary/5"
            />
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {[
                {
                  icon: Calendar,
                  label: "Fecha Sugerida",
                  value: formatShortDate(
                    selectedExtendido.fechaSugeridaSiembra,
                  ),
                },
                {
                  icon: Calendar,
                  label: "Fecha Siembra",
                  value: formatShortDate(selectedExtendido.fechaSiembraReal),
                },
                { icon: Hash, label: "Lote", value: selectedExtendido.lote },
                {
                  icon: Calendar,
                  label: "Año Lote",
                  value: selectedExtendido.anoLote,
                },
                {
                  icon: Activity,
                  label: "Sem/Gr",
                  value: selectedExtendido.semxgr,
                },
                { icon: Hash, label: "C", value: selectedExtendido.c },
                { icon: Hash, label: "G", value: selectedExtendido.g },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 md:gap-3 py-2 border-b border-border/40 last:border-0"
                >
                  <div className="p-1 md:p-1.5 bg-primary/5 rounded-md border border-primary/10 shrink-0">
                    <item.icon className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[7px] md:text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none mb-0.5">
                      {item.label}
                    </p>
                    <p className="text-[10px] md:text-xs font-bold truncate text-foreground">
                      {item.value ?? "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Update programacionSiembra-data-table.tsx**

```typescript
// src/features/programacionSiembra/components/programacionSiembra-data-table.tsx
"use client";

import { DataTable, SlideOverForm } from "@/components/data-display/data-table";
import { useState, useCallback, useMemo, useEffect } from "react";

import {
  AutorizarSiembraDto,
  AutorizarSiembraSchema,
  ProgramacionSiembraDto,
  fieldLabels,
} from "@vivero/shared";

import { ColumnDef } from "@tanstack/react-table";
import { partidaSiembraExportColumns, getRowBg } from "./columns";
import { ProgramacionSiembraViewForm } from "./programacionSiembra-view-form";
import { AutorizarProgramacionSiembraEditForm } from "./autorizar-programacionSiembra-edit-form";
import { useProgramacionSiembraAutorizacion } from "../hooks/useProgramacionSiembraPartidaMutation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface ProgramacionSiembraDataTableProps {
  partidas: ProgramacionSiembraDto[];
  columns: ColumnDef<ProgramacionSiembraDto, unknown>[];
  aSembrarKeys: Set<string>;
  registradasKeys: Set<string>;
}

export function ProgramacionSiembraDataTable({
  partidas,
  columns,
  aSembrarKeys,
  registradasKeys,
}: ProgramacionSiembraDataTableProps) {
  const [slideOverOpen, setSlideOpen] = useState(false);
  const [selectedPartida, setSelectedPartida] = useState<ProgramacionSiembraDto | null>(
    null,
  );
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [selectedWeek, setSelectedWeek] = useState("all");

  const { mutateAsync: autorizarSiembra } = useProgramacionSiembraAutorizacion();

  const formAutorizarSiembra = useForm<AutorizarSiembraDto>({
    resolver: zodResolver(AutorizarSiembraSchema),
  });

  useEffect(() => {
    if (selectedPartida) {
      formAutorizarSiembra.reset({
        partidaId: selectedPartida.partidaId,
        anio: selectedPartida.anio,
        indice: selectedPartida.indice,
      });
    }
  }, [selectedPartida, formAutorizarSiembra]);

  const availableWeeks = useMemo(
    () => [...new Set(partidas.map((p) => p.sem_siembra))].sort().reverse(),
    [partidas],
  );

  const filteredPartidas = useMemo(() => {
    const rows =
      selectedWeek === "all"
        ? partidas
        : partidas.filter((p) => p.sem_siembra === selectedWeek);

    const catOrder = (c: string) =>
      c === "bg-yellow-500/10" ? 0 : c === "bg-green-500/10" ? 1 : 2;

    return [...rows].sort((a, b) => {
      const catA = getRowBg(a, aSembrarKeys, registradasKeys);
      const catB = getRowBg(b, aSembrarKeys, registradasKeys);
      const catDiff = catOrder(catA) - catOrder(catB);
      return catDiff !== 0
        ? catDiff
        : b.fechaSugeridaSiembra.localeCompare(a.fechaSugeridaSiembra);
    });
  }, [partidas, selectedWeek, aSembrarKeys, registradasKeys]);

  const getRowClassName = useCallback(
    (row: ProgramacionSiembraDto) => getRowBg(row, aSembrarKeys, registradasKeys),
    [aSembrarKeys, registradasKeys],
  );

  const isAlreadyAuthorized = useMemo(
    () =>
      selectedPartida
        ? getRowBg(selectedPartida, aSembrarKeys, registradasKeys) !== ""
        : false,
    [selectedPartida, aSembrarKeys, registradasKeys],
  );

  const handleView = useCallback((row: ProgramacionSiembraDto) => {
    setSelectedPartida(row);
    setMode("view");
    setSlideOpen(true);
  }, []);

  const handleAutorizar = useCallback(
    async (data: AutorizarSiembraDto) => {
      try {
        await autorizarSiembra({
          partidaId: data.partidaId,
          anio: data.anio,
          indice: data.indice,
        });
        setSlideOpen(false);
      } catch {}
    },
    [autorizarSiembra],
  );

  const handleOpenChange = useCallback((open: boolean) => {
    setSlideOpen(open);
    if (!open) {
      setSelectedPartida(null);
    }
  }, []);

  const toolbarContent = (
    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
      <CalendarDays className="h-3 w-3 text-muted-foreground" />
      <Select value={selectedWeek} onValueChange={setSelectedWeek}>
        <SelectTrigger className="h-8 w-[140px] rounded-full bg-background border-border/40 focus:ring-primary/20 text-[10px] font-bold uppercase tracking-tight">
          <SelectValue placeholder="Semana" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-border/60 shadow-2xl">
          <SelectItem value="all" className="font-bold text-primary italic">
            Todas
          </SelectItem>
          {availableWeeks.map((week) => (
            <SelectItem key={week} value={week} className="font-medium">
              {week}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredPartidas}
        title="Siembra"
        description="Gestión y monitoreo de bandejas en proceso de siembra"
        tableName="programacion_siembra"
        totalCount={filteredPartidas.length}
        exportColumns={partidaSiembraExportColumns}
        onView={handleView}
        onEdit={(row) => {
          setSelectedPartida(row);
          setMode("edit");
          setSlideOpen(true);
        }}
        canExecuteLabel="Autorizar Siembra"
        columnLabels={fieldLabels.SiembraLegacy}
        toolbarContent={toolbarContent}
        getRowClassName={getRowClassName}
      />

      {selectedPartida && (
        <SlideOverForm
          open={slideOverOpen}
          onOpenChange={handleOpenChange}
          title={`Partida Nº ${selectedPartida.partidaId}`}
          formId="autorizar-siembra-form"
          mode={mode}
          form={formAutorizarSiembra}
          saveLabel="Autorizar Siembra"
          fieldLabels={fieldLabels.SiembraPartida}
          confirm={{
            title: "Autorizar siembra",
            description: "¿Deseas autorizar esta partida para siembra?",
            label: "Autorizar Siembra",
            summaryFields: ["partidaId", "anio", "indice"],
          }}
        >
          <div className="space-y-2">
            {mode === "view" ? (
              <ProgramacionSiembraViewForm selectedExtendido={selectedPartida} />
            ) : (
              <AutorizarProgramacionSiembraEditForm
                form={formAutorizarSiembra}
                onSubmit={handleAutorizar}
                onCancel={() => setSlideOpen(false)}
                selectedSiembra={selectedPartida}
                isAlreadyAuthorized={isAlreadyAuthorized}
              />
            )}
          </div>
        </SlideOverForm>
      )}
    </>
  );
}
```

- [ ] **Step 6: Update autorizar-programacionSiembra-edit-form.tsx**

```typescript
// src/features/programacionSiembra/components/autorizar-programacionSiembra-edit-form.tsx
"use client";

import { Package, Leaf, AlertTriangle } from "lucide-react";
import { AutorizarSiembraDto, ProgramacionSiembraDto } from "@vivero/shared";
import { UseFormReturn } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";

interface AutorizarProgramacionSiembraEditFormProps {
  onSubmit: (data: AutorizarSiembraDto) => Promise<void>;
  onCancel: () => void;
  form: UseFormReturn<AutorizarSiembraDto>;
  selectedSiembra: ProgramacionSiembraDto;
  isAlreadyAuthorized?: boolean;
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="text-xs md:text-sm font-black text-foreground">
        {value}
      </span>
    </div>
  );
}

export function AutorizarProgramacionSiembraEditForm({
  form,
  onSubmit,
  selectedSiembra,
  isAlreadyAuthorized,
}: AutorizarProgramacionSiembraEditFormProps) {
  const loteLabel =
    selectedSiembra.lote !== null || selectedSiembra.anoLote !== null
      ? `${selectedSiembra.anoLote} / ${selectedSiembra.lote}`
      : "Sin Lote Asignado";
  return (
    <Form {...form}>
      <form
        id="autorizar-siembra-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full max-h-[calc(100dvh-130px)] md:max-h-[calc(100dvh-140px)] overflow-y-auto no-scrollbar pb-6"
      >
        {/* Hidden required fields for form validity */}
        <FormField
          control={form.control}
          name="partidaId"
          render={() => <input type="hidden" {...form.register("partidaId")} />}
        />
        <FormField
          control={form.control}
          name="anio"
          render={() => <input type="hidden" {...form.register("anio")} />}
        />
        <FormField
          control={form.control}
          name="indice"
          render={() => <input type="hidden" {...form.register("indice")} />}
        />

        {isAlreadyAuthorized && (
          <div className="flex items-center gap-2 bg-warning/10 border border-warning/30 rounded-xl p-3 md:p-4">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
            <p className="text-xs md:text-sm font-bold text-warning">
              Esta partida ya fue autorizada para siembra
            </p>
          </div>
        )}

        {/* PRODUCT HEADER */}
        <div className="space-y-3 md:space-y-4 shrink-0">
          <div className="flex items-center justify-between bg-primary/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-primary/20 shadow-sm">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <Package className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div>
                <h2 className="text-base md:text-xl font-black tracking-tight leading-none text-foreground uppercase">
                  {selectedSiembra.codigoEspecie}
                </h2>
                <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 md:mt-1.5">
                  {selectedSiembra.nombreEspecie}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DETALLE PARTIDA */}
        <div className="space-y-2 md:space-y-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
              <Leaf className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
            </div>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
              Detalle Partida
            </p>
          </div>
          <div className="bg-muted/20 rounded-xl border border-border/40 p-3 md:p-4 space-y-0">
            <InfoRow label="Contenedores" value={selectedSiembra.nrocont} />
            <InfoRow label="Propiedad" value={selectedSiembra.propiedad} />
            <InfoRow label="Sem / Gr" value={selectedSiembra.semxgr} />
            <InfoRow label="Año / Lote" value={loteLabel} />
            <InfoRow label="Item" value={selectedSiembra.item} />
            <InfoRow label="C" value={selectedSiembra.c} />
            <InfoRow label="G" value={selectedSiembra.g} />
            <InfoRow
              label="Siembra Sugerida"
              value={selectedSiembra.fechaSugeridaSiembra}
            />
            <InfoRow label="Sem Siembra" value={selectedSiembra.sem_siembra} />
          </div>
        </div>
      </form>
    </Form>
  );
}
```

- [ ] **Step 7: Update columns.tsx**

Update import from `SiembraDto` to `ProgramacionSiembraDto`:

```typescript
// src/features/programacionSiembra/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/data-display/data-table";
import { ProgramacionSiembraDto } from "@vivero/shared";
import type { ExportColumn } from "@/lib/export/types";
import { formatShortDate, getLocalDateStr } from "@/lib/date-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function getRowBg(
  row: ProgramacionSiembraDto,
  aSembrarKeys: Set<string>,
  registradasKeys: Set<string>,
) {
  const key = `${row.partidaId}-${row.anio}-${row.indice}`;
  if (aSembrarKeys.has(key)) return "bg-yellow-500/10";
  if (registradasKeys.has(key)) return "bg-green-500/10";
  return "";
}

export function partidaSiembraColumns(
  aSembrarKeys: Set<string>,
  registradasKeys: Set<string>,
): ColumnDef<ProgramacionSiembraDto>[] {
  // ... rest of columns unchanged
}

export const partidaSiembraExportColumns: ExportColumn<ProgramacionSiembraDto>[] = [
  // ... rest unchanged
];
```

---

### Task 6: Update page routes

**Files:**
- Modify: `apps/frontend/src/app/(dashboard)/programacion-siembra/page.tsx`

**Steps:**

- [ ] **Step 1: Update main page.tsx**

```typescript
// src/app/(dashboard)/programacion-siembra/page.tsx

import { ProgramacionSiembraDashboard } from "@/features/programacionSiembra";

export const dynamic = "force-dynamic";

export default function ProgramacionSiembraPage() {
  return <ProgramacionSiembraDashboard />;
}
```

- [ ] **Step 2: Verify partidas-registradas/page.tsx unchanged**

This file imports from `@/features/siembraPartidas` — no changes needed.

---

### Task 7: Verify no broken imports

**Steps:**

- [ ] **Step 1: Run type check**

```bash
pnpm type-check
```

Expected: No errors

- [ ] **Step 2: Run lint**

```bash
pnpm lint
```

Expected: No errors

---

## Self-Review

1. **Spec coverage:** All steps from the task specification are covered
2. **Placeholder scan:** No TBD/TODO placeholders found
3. **Type consistency:** `ProgramacionSiembraDto` used consistently across all files
4. **Import paths:** All updated to match new directory structure
5. **Preserved items:** Spanish toast messages, form IDs, DB column names unchanged
