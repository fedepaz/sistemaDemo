//src/features/users/components/UsersDashboard.tsx

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { userColumns } from "./columns";
import { UsersDataTable } from "./user-data-table";

export function UsersDashboard() {
  return (
    <div className="flex flex-col gap-3">
      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={userColumns.length}
            toolbarContent={
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
                <Skeleton className="h-8 rounded-md w-[140px]" />
              </div>
            }
          />
        }
      >
        <UsersDataTable />
      </Suspense>
    </div>
  );
}
