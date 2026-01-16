//src/features/plants/components/plant-dashboard-skeleton.tsx

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { plantColumns } from "./columns";

import { KPICardSkeleton } from "@/components/data-display/kpi-card";

export function PlantsDashboardSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>

      <DataTableSkeleton columnCount={plantColumns.length} />
    </div>
  );
}
