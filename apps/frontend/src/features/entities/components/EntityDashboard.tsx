// src/features/entities/components/EntityDashboard.tsx

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { EntityDataTable } from "./entity-data-table";
import { entityColumns } from "./columns";
import { EntitiesKPIs } from "./entities-kpi";
import { KPICardSkeleton } from "@/components/data-display/kpi-card";
import { LoadingBoundary } from "@/components/common/loading-boundary";

export function EntityDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <LoadingBoundary
        skeleton={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <KPICardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <EntitiesKPIs />
      </LoadingBoundary>

      <LoadingBoundary
        skeleton={<DataTableSkeleton columnCount={entityColumns.length} />}
      >
        <EntityDataTable />
      </LoadingBoundary>
    </div>
  );
}
