// apps/frontend/src/features/extendidos/components/extendido-dashboad-skeleton.tsx
"use client";

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { partidaColumns } from "./columns";

function ExtendidoToolbarSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
      <Skeleton className="h-8 rounded-full px-3 w-[70px]" />
      <Skeleton className="h-8 rounded-full w-[140px]" />
    </div>
  );
}

export function ExtendidoDashboardSkeleton() {
  return (
    <div className="space-y-4">
      <DataTableSkeleton
        columnCount={partidaColumns.length}
        toolbarContent={<ExtendidoToolbarSkeleton />}
      />
    </div>
  );
}
