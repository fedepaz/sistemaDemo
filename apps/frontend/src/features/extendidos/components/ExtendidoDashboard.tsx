//src/features/plants/components/PlantsDashboard.tsx

import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { ExtendidoDataTable } from "./extendido-data-table";
import { partidaExampleColumns } from "./columns";

export function ExtendidoDashboard() {
  return (
    <>
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={partidaExampleColumns.length} />
        }
      >
        <ExtendidoDataTable />
      </Suspense>
    </>
  );
}
