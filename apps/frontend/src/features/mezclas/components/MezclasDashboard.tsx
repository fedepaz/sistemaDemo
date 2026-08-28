// apps/frontend/src/features/mezclas/components/MezclasDashboard.tsx
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { Suspense } from "react";
import { MezclaDataTable } from "./mezcla-data-table";
import { mezclaColumns } from "./columns";

export function MezclasDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <Suspense
        fallback={<DataTableSkeleton columnCount={mezclaColumns.length} />}
      >
        <MezclaDataTable />
      </Suspense>
    </div>
  );
}
