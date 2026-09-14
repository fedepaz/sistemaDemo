"use client";

import { EmptyState } from "@/features/siembra/components/empty-state";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { aSembrarColumns } from "./columns";
import { ASembrarDataTable } from "./a-sembrar-data-table";
import { useASembrarPartidas } from "../hooks/useASembrarPartidas";
import { LoadingBoundary } from "@/components/common/loading-boundary";

function ASembrarList() {
  const { data: partidas, isFetching } = useASembrarPartidas();
  const hasData = partidas && partidas.length > 0;

  if (!hasData && !isFetching) {
    return (
      <EmptyState
        title="Sin partidas pendientes"
        description="No hay partidas autorizadas pendientes de completar siembra."
      />
    );
  }

  return <ASembrarDataTable partidas={partidas || []} />;
}

export function ASembrarView() {
  return (
    <div className="space-y-2">
      <LoadingBoundary
        skeleton={
          <DataTableSkeleton columnCount={aSembrarColumns.length} />
        }
      >
        <ASembrarList />
      </LoadingBoundary>
    </div>
  );
}