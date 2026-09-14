// apps/frontend/src/features/extendidos/components/extendidos-view.tsx
"use client";

import { useState } from "react";
import { ExtendidoDataTable } from "./extendido-data-table";
import { useExtendidos } from "../hooks/useExtendidosWithFilters";
import { EmptyState } from "./empty-state";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { partidaColumns } from "./columns";
import { LoadingBoundary } from "@/components/common/loading-boundary";

function ExtendidoList({
  camaraId,
  onCamaraChange,
}: {
  camaraId: string;
  onCamaraChange: (id: string) => void;
}) {
  const { data: extendidos, isFetching } = useExtendidos(camaraId);

  const hasData = extendidos && extendidos.length > 0;

  if (!hasData && !isFetching && camaraId === "all") {
    return (
      <EmptyState
        title="Sin registros"
        description="No hay registros de extendidos en cámara actualmente."
      />
    );
  }

  return (
    <ExtendidoDataTable
      partidas={extendidos || []}
      onCamaraChange={onCamaraChange}
      currentCamaraId={camaraId}
    />
  );
}

export function ExtendidoView() {
  const [camaraId, setCamaraId] = useState<string>("all");

  return (
    <div className="space-y-2">
      <LoadingBoundary
        skeleton={
          <DataTableSkeleton
            columnCount={partidaColumns.length}
            toolbarContent={
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
                <Skeleton className="h-8 rounded-full px-3 w-[70px]" />
                <Skeleton className="h-8 rounded-full w-[140px]" />
              </div>
            }
          />
        }
      >
        <ExtendidoList camaraId={camaraId} onCamaraChange={setCamaraId} />
      </LoadingBoundary>
    </div>
  );
}
