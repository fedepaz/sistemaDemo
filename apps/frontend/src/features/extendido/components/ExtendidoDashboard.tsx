//src/features/plants/components/PlantsDashboard.tsx

import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { plantColumns } from "./columns";
import { KPICardSkeleton } from "@/components/data-display/kpi-card";
import PlantKPIs from "./extendido-kpi";
import { ExtendidoDataTable } from "./extendido-data-table";

export function ExtendidoDashboard() {
  return (
    <>
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <KPICardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <PlantKPIs />
      </Suspense>

      <Suspense
        fallback={<DataTableSkeleton columnCount={plantColumns.length} />}
      >
        <ExtendidoDataTable />
      </Suspense>
    </>
  );
}
