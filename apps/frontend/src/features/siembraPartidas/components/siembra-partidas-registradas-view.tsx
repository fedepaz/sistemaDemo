"use client";

import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { siembraPartidasRegistradasColumns } from "./columns";
import { SiembraPartidasRegistradasDataTable } from "./siembra-partidas-registradas-data-table";
import { useSiembraPartidasRegistradas } from "../hooks/useSiembraPartidasRegistradas";

function SiembraPartidasRegistradasList() {
  const { data: partidas } = useSiembraPartidasRegistradas();
  return <SiembraPartidasRegistradasDataTable partidas={partidas || []} />;
}

export function SiembraPartidasRegistradasView() {
  return (
    <div className="space-y-2">
      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={siembraPartidasRegistradasColumns.length}
          />
        }
      >
        <SiembraPartidasRegistradasList />
      </Suspense>
    </div>
  );
}
