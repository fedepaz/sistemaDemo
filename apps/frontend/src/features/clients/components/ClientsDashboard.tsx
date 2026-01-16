//src/features/clients/components/ClientsDashboard.tsx

import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/data-display/data-table";
import { clientColumns } from "./columns";
import ClientsKPI from "./clients-kpi";
import { KPICardSkeleton } from "@/components/data-display/kpi-card";
import { ClientsDataTable } from "./clients-data-table";

export function ClientsDashboard() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <KPICardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <ClientsKPI />
      </Suspense>

      <Suspense
        fallback={<DataTableSkeleton columnCount={clientColumns.length} />}
      >
        <ClientsDataTable />
      </Suspense>
    </div>
  );
}
