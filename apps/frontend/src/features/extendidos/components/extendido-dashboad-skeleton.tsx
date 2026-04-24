"use client";

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { partidaColumns } from "./columns";
import { ExtendidosSelectorSkeleton } from "./extendidos-selector-skeleton";

export function ExtendidoDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <ExtendidosSelectorSkeleton />

      <DataTableSkeleton columnCount={partidaColumns.length} />
    </div>
  );
}
