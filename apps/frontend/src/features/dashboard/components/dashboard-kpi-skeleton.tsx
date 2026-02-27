// src/features/dashboard/components/dashboard-kpi-skeleton.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardKPISkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row lg:items-center px-1">
          {/* Left: Date header skeleton */}
          <div className="bg-secondary/50 px-2 py-2 lg:rounded-l-lg shrink-0 w-full lg:w-[220px]">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-5 w-[140px]" />
            </div>
          </div>

          {/* Middle: Current conditions skeleton */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 px-4 py-3 flex-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-muted/50 rounded-lg px-3 py-2 flex items-center gap-2 sm:shrink-0 w-full sm:w-[100px]"
              >
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>

          {/* Right: Forecast skeleton */}
          <div className="flex items-center justify-center gap-2 px-4 py-2 border-t lg:border-t-0 lg:border-l border-border shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="relative rounded-md px-4 py-1 text-center bg-muted/30"
              >
                <Skeleton className="h-3 w-8 mb-1 mx-auto" />
                <Skeleton className="h-4 w-6 mb-1 mx-auto" />
                <Skeleton className="h-3 w-6 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
