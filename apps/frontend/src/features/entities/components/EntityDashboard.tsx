// src/features/entities/components/EntityDashboard.tsx

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { Suspense } from "react";
import { EntityDataTable } from "./entity-data-table";
import { entityColumns } from "./columns";

export function EntityDashboard() {
  return (
    <>
      <Suspense
        fallback={<DataTableSkeleton columnCount={entityColumns.length} />}
      >
        <EntityDataTable />
      </Suspense>
    </>
  );
}
