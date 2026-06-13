// src/features/dashboard/components/dashboard-kpi-skeleton.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DashboardKPISkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col xl:flex-row xl:items-center px-0.5">
          {/* Middle: Current conditions skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:flex xl:flex-nowrap items-center gap-2 px-2 py-2 flex-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-muted/50 rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 flex items-center gap-2 flex-1"
              >
                <Skeleton className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-2 w-6" />
                  <Skeleton className="h-4 w-10" />
                </div>
              </div>
            ))}
          </div>

          {/* Right: Forecast skeleton */}
          <div className="flex items-center justify-center gap-1.5 px-2 py-2 border-t xl:border-t-0 xl:border-l border-border/50 shrink-0 bg-muted/5 overflow-x-auto w-full xl:w-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "relative rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-center bg-background border border-border/50 shrink-0",
                  i >= 3 && "hidden md:block",
                )}
              >
                <Skeleton className="h-2 w-6 mb-1 mx-auto" />
                <Skeleton className="h-3.5 w-6 mb-0.5 mx-auto" />
                <Skeleton className="h-2 w-4 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
