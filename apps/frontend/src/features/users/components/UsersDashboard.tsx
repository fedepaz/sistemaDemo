//src/features/users/components/UsersDashboard.tsx

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { Suspense } from "react";
import { userColumns } from "./columns";
import { UsersDataTable } from "./user-data-table";

export function UsersDashboard() {
  return (
    <>
      <Suspense
        fallback={<DataTableSkeleton columnCount={userColumns.length} />}
      >
        <UsersDataTable />
      </Suspense>
    </>
  );
}
