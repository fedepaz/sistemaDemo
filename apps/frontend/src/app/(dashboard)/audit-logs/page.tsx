// src/app/(dashboard)/audit_logs/page.tsx

import { AuditLogDashboard } from "@/features/auditLogs";

export const dynamic = "force-dynamic";

export default function AuditLogsPage() {
  return <AuditLogDashboard />;
}
