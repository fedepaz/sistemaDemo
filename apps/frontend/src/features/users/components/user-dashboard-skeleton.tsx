// src/features/users/components/users-dashboard-skeleton.tsx
"use client";

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { userColumns } from "./columns";

function UsersToolbarSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
      <Skeleton className="h-8 rounded-md w-[140px]" />
    </div>
  );
}

export function UsersDashboardSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={userColumns.length}
      toolbarContent={<UsersToolbarSkeleton />}
    />
  );
}
