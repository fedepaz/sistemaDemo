//src/features/invoices/components/InvoicesDashboard.tsx

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { invoiceColumns } from "./columns";

export function InvoicesDashboardSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <DataTableSkeleton columnCount={invoiceColumns.length} />
    </div>
  );
}
