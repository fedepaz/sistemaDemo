// src/features/alerts/components/alert-dashboard-skeleton.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function AlertDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
