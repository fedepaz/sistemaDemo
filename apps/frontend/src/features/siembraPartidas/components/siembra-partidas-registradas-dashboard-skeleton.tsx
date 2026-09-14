"use client";

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { siembraPartidasRegistradasColumns } from "./columns";

export function SiembraPartidasRegistradasDashboardSkeleton() {
  return (
    <div className="space-y-4">
      <DataTableSkeleton
        columnCount={siembraPartidasRegistradasColumns.length}
      />
    </div>
  );
}
