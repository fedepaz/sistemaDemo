// apps/frontend/src/features/siembra/components/siembra-dashboard-skeleton.tsx
"use client";

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { partidaSiembraColumns } from "./columns";

export function SiembraDashboardSkeleton() {
  return (
    <div className="space-y-4">
      <DataTableSkeleton columnCount={partidaSiembraColumns.length} />
    </div>
  );
}
