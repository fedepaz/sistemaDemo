// src/features/auditLogs/components/AuditLogDashboard.tsx

import { Suspense } from "react";
import { AuditLogDataTable } from "./auditLog-data-table";
import { AuditLogDashboardSkeleton } from "./auditLog-dashboard-skeleton";
import { ErrorBoundary } from "@/components/error/error-boundary";

export function AuditLogDashboard() {
  return (
    <div className="flex flex-col gap-3">
      <ErrorBoundary>
        <Suspense fallback={<AuditLogDashboardSkeleton />}>
          <AuditLogDataTable />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
