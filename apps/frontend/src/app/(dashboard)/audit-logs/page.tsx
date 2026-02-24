// src/app/(dashboard)/audit_logs/page.tsx

import {
  AuditLogDashboard,
  AuditLogDashboardSkeleton,
} from "@/features/auditLogs";
import { Suspense } from "react";

export default function AuditLogsPage() {
  return (
    <Suspense fallback={<AuditLogDashboardSkeleton />}>
      <AuditLogDashboard />
    </Suspense>
  );
}
