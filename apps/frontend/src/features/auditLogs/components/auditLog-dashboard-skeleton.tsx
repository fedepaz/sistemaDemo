// src/features/users/components/users-dashboard-skeleton.tsx
"use client";

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { auditLogColumns } from "./columns";

export function AuditLogDashboardSkeleton() {
  return <DataTableSkeleton columnCount={auditLogColumns.length} />;
}
