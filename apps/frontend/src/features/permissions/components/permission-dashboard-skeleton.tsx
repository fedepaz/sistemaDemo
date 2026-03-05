// src/features/permissions/components/permission-dashboard-skeleton.tsx

import { PermissionsManagerSkeleton } from "./permission-manager-skeleton";

export function PermissionsDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6 bg-muted/5">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 lg:w-52">
        <div className="h-11 w-11 rounded-xl bg-muted animate-pulse" />
        <div className="flex flex-col gap-2">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-2.5 w-16 rounded bg-muted animate-pulse" />
        </div>
      </div>
      {/* Search area skeleton */}
      <PermissionsManagerSkeleton />
      {/* Footer area skeleton */}
      <div className="flex items-center gap-4 lg:w-52">
        <div className="h-11 w-11 rounded-xl bg-muted animate-pulse" />
        <div className="flex flex-col gap-2">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-2.5 w-16 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}
