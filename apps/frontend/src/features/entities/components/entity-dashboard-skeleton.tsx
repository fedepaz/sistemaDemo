// src/features/entities/components/entity-dashboard-skeleton.tsx
"use client";

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { entityColumns } from "./columns";

export function EntityDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <DataTableSkeleton columnCount={entityColumns.length} />
    </div>
  );
}
