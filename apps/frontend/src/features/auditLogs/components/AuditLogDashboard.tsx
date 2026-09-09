// src/features/auditLogs/components/AuditLogDashboard.tsx

import { AuditLogDataTable } from "./auditLog-data-table";
import { AuditLogDashboardSkeleton } from "./auditLog-dashboard-skeleton";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { LoadingBoundary } from "@/components/common/loading-boundary";

export function AuditLogDashboard() {
  return (
    <div className="flex flex-col gap-3">
      <ErrorBoundary>
        <LoadingBoundary skeleton={<AuditLogDashboardSkeleton />}>
          <AuditLogDataTable />
        </LoadingBoundary>
      </ErrorBoundary>
    </div>
  );
}
