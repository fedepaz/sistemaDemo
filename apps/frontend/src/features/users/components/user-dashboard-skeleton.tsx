// src/features/users/components/users-dashboard-skeleton.tsx
"use client";

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { userColumns } from "./columns";

export function UsersDashboardSkeleton() {
  return <DataTableSkeleton columnCount={userColumns.length} />;
}
