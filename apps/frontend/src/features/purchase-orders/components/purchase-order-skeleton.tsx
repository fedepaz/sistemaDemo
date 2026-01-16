//src/features/invoices/components/InvoicesDashboard.tsx
"use client";

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { purchaseOrderColumns } from "./columns";

export function PurchaseOrdersDashboardSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <DataTableSkeleton columnCount={purchaseOrderColumns.length} />
    </div>
  );
}
