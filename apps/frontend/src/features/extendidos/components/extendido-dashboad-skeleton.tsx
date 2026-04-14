//src/features/plants/components/plant-dashboard-skeleton.tsx

import { DataTableSkeleton } from "@/components/data-display/data-table";

import { KPICardSkeleton } from "@/components/data-display/kpi-card";
import { partidaExampleColumns } from "./columns";

export function ExtendidoDashboardSkeleton() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>

      <DataTableSkeleton columnCount={partidaExampleColumns.length} />
    </>
  );
}
