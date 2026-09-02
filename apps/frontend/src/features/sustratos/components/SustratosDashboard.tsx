// apps/frontend/src/features/sustratos/components/SustratosDashboard.tsx
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { Suspense } from "react";
import { SustratoDataTable } from "./sustrato-data-table";
import { sustratoColumns } from "./columns";

export function SustratosDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <Suspense
        fallback={<DataTableSkeleton columnCount={sustratoColumns.length} />}
      >
        <SustratoDataTable />
      </Suspense>
    </div>
  );
}
