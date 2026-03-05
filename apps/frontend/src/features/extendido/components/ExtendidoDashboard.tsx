//src/features/plants/components/PlantsDashboard.tsx

import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { plantColumns } from "./columns";
import { ExtendidoDataTable } from "./extendido-data-table";

export function ExtendidoDashboard() {
  return (
    <>
      <Suspense
        fallback={<DataTableSkeleton columnCount={plantColumns.length} />}
      >
        <ExtendidoDataTable />
      </Suspense>
    </>
  );
}
