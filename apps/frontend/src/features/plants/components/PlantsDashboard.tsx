//src/features/plants/components/PlantsDashboard.tsx

import React, { Suspense } from "react";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { plantColumns } from "./columns";
import { KPICardSkeleton } from "@/components/data-display/kpi-card";
import { PlantsDataTable } from "./plants-data-table";
import PlantKPIs from "./plants-kpi";

export function PlantsDashboard() {
  return (
    <div className="container mx-auto py-8 space-y-8">
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
        <PlantsDataTable />
      </Suspense>
    </div>
  );
}
