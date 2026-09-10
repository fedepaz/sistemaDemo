// apps/frontend/src/features/siembra/components/siembra-view.tsx
"use client";

import { useMemo } from "react";
import { EmptyState } from "./empty-state";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { partidaSiembraColumns } from "./columns";

import { SiembraDataTable } from "./siembra-data-table";
import { useSiembraPartidas } from "../hooks/useSiembraPartidas";
import { useASembrarPartidas } from "@/features/aSembrar/hooks/useASembrarPartidas";
import { useSiembraPartidasRegistradas } from "@/features/siembraPartidas/hooks/useSiembraPartidasRegistradas";
import { LoadingBoundary } from "@/components/common/loading-boundary";

function SiembraList({ camaraId }: { camaraId: string }) {
  const { data: siembraPartidas, isFetching } = useSiembraPartidas();
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
    <SiembraDataTable
      partidas={siembraPartidas || []}
      columns={columns}
      aSembrarKeys={aSembrarKeys}
      registradasKeys={registradasKeys}
    />
  );
}

export function SiembraView() {
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
        <SiembraList camaraId="all" />
      </LoadingBoundary>
    </div>
  );
}
