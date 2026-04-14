// src/features/extendidos/components/extendido-dashboad-skeleton.tsx

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { KPICardSkeleton } from "@/components/data-display/kpi-card";
import { partidaColumns } from "./columns";

export function ExtendidoDashboardSkeleton() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>

      <DataTableSkeleton columnCount={partidaColumns.length} />
    </>
  );
}
