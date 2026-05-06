// src/features/dashboard/components/dashboard-kpi-skeleton.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DashboardKPISkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col 2xl:flex-row 2xl:items-center px-1">
          {/* Middle: Current conditions skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 2xl:flex 2xl:flex-nowrap items-center gap-2 sm:gap-4 px-3 py-3 sm:px-6 sm:py-4 flex-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-muted/50 rounded-xl sm:rounded-2xl px-2.5 py-2.5 sm:px-5 sm:py-3.5 flex items-center gap-2.5 sm:gap-4 sm:shrink-0 flex-1"
              >
                <Skeleton className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-2 w-8" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            ))}
          </div>

          {/* Right: Forecast skeleton */}
          <div className="flex items-center justify-between sm:justify-center gap-4 px-8 py-4 border-t 2xl:border-t-0 2xl:border-l border-border/50 shrink-0 bg-muted/5 overflow-x-auto w-full 2xl:w-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "relative rounded-xl px-5 py-3 text-center bg-background border border-border/50 shrink-0",
                  i >= 3 && "hidden md:block",
                )}
              >
                <Skeleton className="h-2 w-8 mb-2 mx-auto" />
                <Skeleton className="h-5 w-8 mb-1 mx-auto" />
                <Skeleton className="h-2 w-6 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
