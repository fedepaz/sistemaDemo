// src/features/extendidos/components/ExtendidoDashboard.tsx

import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { partidaColumns } from "./columns";
import { ExtendidoView } from "./extendidos-view";

export function ExtendidoDashboard() {
  return (
    <>
      <Suspense
        fallback={<DataTableSkeleton columnCount={partidaColumns.length} />}
      >
        <ExtendidoView />
      </Suspense>
    </>
  );
}
