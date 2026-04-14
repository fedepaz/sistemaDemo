// src/features/extendidos/components/ExtendidoDashboard.tsx

import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { ExtendidoDataTable } from "./extendido-data-table";
import { partidaColumns } from "./columns";

export function ExtendidoDashboard() {
  return (
    <>
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={partidaColumns.length} />
        }
      >
        <ExtendidoDataTable />
      </Suspense>
    </>
  );
}
