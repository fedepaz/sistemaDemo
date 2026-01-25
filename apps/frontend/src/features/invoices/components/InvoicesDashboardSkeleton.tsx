//src/features/invoices/components/InvoicesDashboard.tsx

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { invoiceColumns } from "./columns";

export function InvoicesDashboardSkeleton() {
  return <DataTableSkeleton columnCount={invoiceColumns.length} />;
}
