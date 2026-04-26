// apps/frontend/src/features/extendidos/components/extendido-dashboad-skeleton.tsx
"use client";

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { partidaColumns } from "./columns";

export function ExtendidoDashboardSkeleton() {
  return (
    <div className="space-y-4">
      <DataTableSkeleton columnCount={partidaColumns.length} />
    </div>
  );
}
