// src/features/dashboard/components/dashboard-kpi-skeleton.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DashboardKPISkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col xl:flex-row xl:items-center px-1">
          {/* Left: Date header skeleton */}
          <div className="bg-secondary/30 px-6 py-4 xl:rounded-l-lg shrink-0 w-full xl:w-[220px] border-r border-border/50">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>

          {/* Middle: Current conditions skeleton */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap xl:flex-nowrap sm:items-center gap-4 px-6 py-4 flex-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-muted/50 rounded-2xl px-5 py-3 flex items-center gap-4 sm:shrink-0 w-full sm:w-[140px]"
              >
                <Skeleton className="h-6 w-6 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-2 w-8" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            ))}
          </div>

          {/* Right: Forecast skeleton */}
          <div className="flex items-center justify-start xl:justify-center gap-4 px-8 py-4 border-t xl:border-t-0 xl:border-l border-border/50 shrink-0 bg-muted/5 overflow-x-auto w-full xl:w-auto">
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
