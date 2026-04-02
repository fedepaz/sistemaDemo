// src/features/entities/components/entity-dashboard-skeleton.tsx
"use client";

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { entityColumns } from "./columns";
import { KPICardSkeleton } from "@/components/data-display/kpi-card";

export function EntityDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
      <DataTableSkeleton columnCount={entityColumns.length} />
    </div>
  );
}
