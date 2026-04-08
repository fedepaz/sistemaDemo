// src/features/permissions/components/permission-selector-skeleton.tsx

import { Skeleton } from "@/components/ui/skeleton";

export function PermissionSelectorSkeleton() {
  return (
    <div className="px-6 py-6 bg-background">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="space-y-1.5 lg:flex-1">
          <Skeleton className="h-3 w-32 mb-2 ml-1" />
          <Skeleton className="h-11 w-full rounded-xl lg:max-w-md" />
        </div>
      </div>
    </div>
  );
}
