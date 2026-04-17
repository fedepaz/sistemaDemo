// src/features/dashboard/components/dashboard-kpi-skeleton.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DashboardKPISkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row lg:items-center px-1">
          {/* Left: Date header skeleton */}
          <div className="bg-secondary/30 px-4 py-3 lg:rounded-l-lg shrink-0 w-full lg:w-[220px]">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>

          {/* Middle: Current conditions skeleton */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 px-4 py-3 flex-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-muted/50 rounded-xl px-4 py-2.5 flex items-center gap-3 sm:shrink-0 w-full sm:w-[120px]"
              >
                <Skeleton className="h-5 w-5 rounded" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-2 w-8" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
            ))}
          </div>

          {/* Right: Forecast skeleton */}
          <div className="flex items-center justify-center gap-3 px-6 py-3 border-t lg:border-t-0 lg:border-l border-border/50 shrink-0 bg-muted/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "relative rounded-lg px-4 py-2 text-center bg-background border border-border/50 shrink-0",
                  i >= 3 && "hidden md:block",
                )}
              >
                <Skeleton className="h-2 w-8 mb-2 mx-auto" />
                <Skeleton className="h-4 w-6 mb-1 mx-auto" />
                <Skeleton className="h-2 w-6 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
