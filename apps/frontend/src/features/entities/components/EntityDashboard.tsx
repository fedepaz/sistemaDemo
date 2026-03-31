// src/features/entities/components/EntityDashboard.tsx

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { Suspense } from "react";
import { EntityDataTable } from "./entity-data-table";
import { entityColumns } from "./columns";
import { EntitiesKPIs } from "./entities-kpi";
import { KPICardSkeleton } from "@/components/data-display/kpi-card";

export function EntityDashboard() {
  return (
    <div className="flex flex-col gap-8">
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <KPICardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <EntitiesKPIs />
      </Suspense>

      <Suspense
        fallback={<DataTableSkeleton columnCount={entityColumns.length} />}
      >
        <EntityDataTable />
      </Suspense>
    </div>
  );
}
