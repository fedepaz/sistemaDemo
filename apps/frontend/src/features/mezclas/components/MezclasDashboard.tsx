// apps/frontend/src/features/mezclas/components/MezclasDashboard.tsx
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { MezclaDataTable } from "./mezcla-data-table";
import { mezclaColumns } from "./columns";
import { LoadingBoundary } from "@/components/common/loading-boundary";

export function MezclasDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <LoadingBoundary
        skeleton={<DataTableSkeleton columnCount={mezclaColumns.length} />}
      >
        <MezclaDataTable />
      </LoadingBoundary>
    </div>
  );
}
