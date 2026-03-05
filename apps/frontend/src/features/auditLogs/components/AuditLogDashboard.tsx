//src/features/users/components/UsersDashboard.tsx

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { Suspense } from "react";
import { auditLogColumns } from "./columns";
import { AuditLogDataTable } from "./auditLog-data-table";

export function AuditLogDashboard() {
  return (
    <>
      <Suspense
        fallback={<DataTableSkeleton columnCount={auditLogColumns.length} />}
      >
        <AuditLogDataTable />
      </Suspense>
    </>
  );
}
