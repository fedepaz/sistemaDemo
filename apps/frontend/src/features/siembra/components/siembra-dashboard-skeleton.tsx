// apps/frontend/src/features/siembra/components/siembra-dashboard-skeleton.tsx
"use client";

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { partidaSiembraColumns } from "./columns";

function SiembraToolbarSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
      <Skeleton className="h-3 w-3 rounded-full" />
      <Skeleton className="h-8 rounded-full w-[140px]" />
    </div>
  );
}

export function SiembraDashboardSkeleton() {
  return (
    <div className="space-y-4">
      <DataTableSkeleton
        columnCount={partidaSiembraColumns.length}
        toolbarContent={<SiembraToolbarSkeleton />}
      />
    </div>
  );
}
