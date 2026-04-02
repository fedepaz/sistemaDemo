import { Skeleton } from "@/components/ui/skeleton";
import { PermissionsManagerSkeleton } from "./permission-manager-skeleton";

export function PermissionsDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 bg-muted/5">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 lg:w-52 shrink-0">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-2.5 w-16 rounded" />
        </div>
      </div>
      {/* Search area skeleton */}
      <PermissionsManagerSkeleton />
      {/* Footer area skeleton */}
      <div className="flex items-center gap-4 lg:w-52 shrink-0">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-2.5 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}
