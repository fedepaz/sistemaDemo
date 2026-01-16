//src/features/purchase-orders/components/PurchaseOrdersDashboard.tsx

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { Suspense } from "react";
import { PurchaseOrdersDataTable } from "./purchase-order-data-table";
import { KPICardSkeleton } from "@/components/data-display/kpi-card";
import { purchaseOrderColumns } from "./columns";
import PurchaseOrderKPIs from "./purchase-orders-kpi";

export function PurchaseOrdersDashboard() {
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
        <PurchaseOrderKPIs />
      </Suspense>

      <Suspense
        fallback={
          <DataTableSkeleton columnCount={purchaseOrderColumns.length} />
        }
      >
        <PurchaseOrdersDataTable />
      </Suspense>
    </div>
  );
}
