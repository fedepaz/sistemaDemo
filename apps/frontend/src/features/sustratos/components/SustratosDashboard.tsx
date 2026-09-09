// apps/frontend/src/features/sustratos/components/SustratosDashboard.tsx
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { SustratoDataTable } from "./sustrato-data-table";
import { sustratoColumns } from "./columns";
import { LoadingBoundary } from "@/components/common/loading-boundary";

export function SustratosDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <LoadingBoundary
        skeleton={<DataTableSkeleton columnCount={sustratoColumns.length} />}
      >
        <SustratoDataTable />
      </LoadingBoundary>
    </div>
  );
}
