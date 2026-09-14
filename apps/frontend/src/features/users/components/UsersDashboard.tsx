//src/features/users/components/UsersDashboard.tsx

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { userColumns } from "./columns";
import { UsersDataTable } from "./user-data-table";
import { LoadingBoundary } from "@/components/common/loading-boundary";

export function UsersDashboard() {
  return (
    <div className="flex flex-col gap-3">
      <LoadingBoundary
        skeleton={
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
      </LoadingBoundary>
    </div>
  );
}
