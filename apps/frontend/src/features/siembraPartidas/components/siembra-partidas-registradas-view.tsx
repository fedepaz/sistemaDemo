"use client";

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { siembraPartidasRegistradasColumns } from "./columns";
import { SiembraPartidasRegistradasDataTable } from "./siembra-partidas-registradas-data-table";
import { useSiembraPartidasRegistradas } from "../hooks/useSiembraPartidasRegistradas";
import { LoadingBoundary } from "@/components/common/loading-boundary";

function SiembraPartidasRegistradasList() {
  const { data: partidas } = useSiembraPartidasRegistradas();
  return <SiembraPartidasRegistradasDataTable partidas={partidas || []} />;
}

export function SiembraPartidasRegistradasView() {
  return (
    <div className="space-y-2">
      <LoadingBoundary
        skeleton={
          <DataTableSkeleton
            columnCount={siembraPartidasRegistradasColumns.length}
          />
        }
      >
        <SiembraPartidasRegistradasList />
      </LoadingBoundary>
    </div>
  );
}
