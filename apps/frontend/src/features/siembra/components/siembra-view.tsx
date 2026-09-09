// apps/frontend/src/features/siembra/components/siembra-view.tsx
"use client";

import { EmptyState } from "./empty-state";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { partidaSiembraColumns } from "./columns";

import { SiembraDataTable } from "./siembra-data-table";
import { useSiembraPartidas } from "../hooks/useSiembraPartidas";
import { LoadingBoundary } from "@/components/common/loading-boundary";

function SiembraList({ camaraId }: { camaraId: string }) {
  const { data: siembraPartidas, isFetching } = useSiembraPartidas();

  const hasData = siembraPartidas && siembraPartidas.length > 0;

  if (!hasData && !isFetching && camaraId === "all") {
    return (
      <EmptyState
        title="Sin registros"
        description="No hay registros de extendidos en cámara actualmente."
      />
    );
  }

  return <SiembraDataTable partidas={siembraPartidas || []} />;
}

export function SiembraView() {
  return (
    <div className="space-y-2">
      <LoadingBoundary
        skeleton={
          <DataTableSkeleton
            columnCount={partidaSiembraColumns.length}
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
