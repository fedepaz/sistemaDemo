//src/features/users/components/UsersDashboard.tsx

import { DataTableSkeleton } from "@/components/data-display/data-table";
import { KPICardSkeleton } from "@/components/data-display/kpi-card";
import { Suspense } from "react";
import { userColumns } from "./columns";
import { UsersDataTable } from "./user-data-table";
import UserKPIs from "./user-kpi";

export function UsersDashboard() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <KPICardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <UserKPIs />
      </Suspense>

      <Suspense
        fallback={<DataTableSkeleton columnCount={userColumns.length} />}
      >
        <UsersDataTable />
      </Suspense>
    </div>
  );
}
