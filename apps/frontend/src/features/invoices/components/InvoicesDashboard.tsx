//src/features/invoices/components/InvoicesDashboard.tsx

import { DataTableSkeleton } from "@/components/data-display/data-table";
import React, { Suspense } from "react";
import { KPICardSkeleton } from "@/components/data-display/kpi-card";
import InvoiceKPIs from "./invoices-kpi";
import { InvoicesDataTable } from "./invoices-data-table";
import { invoiceColumns } from "./columns";

export function InvoicesDashboard() {
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
        <InvoiceKPIs />
      </Suspense>

      <Suspense
        fallback={<DataTableSkeleton columnCount={invoiceColumns.length} />}
      >
        <InvoicesDataTable />
      </Suspense>
    </div>
  );
}
