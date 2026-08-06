// src/features/auditLogs/components/AuditLogDashboard.tsx

import { Suspense } from "react";
import { AuditLogDataTable } from "./auditLog-data-table";
import { AuditLogDashboardSkeleton } from "./auditLog-dashboard-skeleton";

export function AuditLogDashboard() {
  return (
    <div className="flex flex-col gap-3">
      <Suspense fallback={<AuditLogDashboardSkeleton />}>
        <AuditLogDataTable />
      </Suspense>
    </div>
  );
}
