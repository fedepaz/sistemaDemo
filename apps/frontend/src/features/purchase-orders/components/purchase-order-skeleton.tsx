//src/features/invoices/components/InvoicesDashboard.tsx
"use client";

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { purchaseOrderColumns } from "./columns";

export function PurchaseOrdersDashboardSkeleton() {
  return <DataTableSkeleton columnCount={purchaseOrderColumns.length} />;
}
