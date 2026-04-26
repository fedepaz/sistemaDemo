// src/features/dashboard/components/dashboard-alerts-skeleton.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardAlertsSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col border-border/40 shadow-sm h-full">
      {/* Header Skeleton */}
      <div className="bg-primary/20 px-3 py-2 sm:px-4 sm:py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 sm:h-7 sm:w-7 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-16 sm:w-20" />
              <Skeleton className="h-2 w-8" />
            </div>
          </div>
          <Skeleton className="h-2.5 w-10 sm:w-12" />
        </div>
      </div>

      <CardContent className="p-2 sm:p-3 flex-1 overflow-auto bg-card">
        <div className="flex flex-col gap-2 sm:gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted/30 rounded-lg sm:rounded-xl p-2 sm:p-3 flex-1 flex flex-col justify-center border border-transparent"
            >
              {/* Currency Header Skeleton */}
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded-md sm:rounded-lg" />
                  <Skeleton className="h-3 w-14 sm:w-16" />
                </div>
              </div>

              {/* Buy/Sell Rates Skeleton */}
              <div className="flex gap-1.5 sm:gap-2">
                <div className="bg-background/50 rounded-md sm:rounded-lg px-2 py-1 sm:px-3 sm:py-2 flex-1 space-y-1 sm:space-y-2">
                  <Skeleton className="h-2 w-6 sm:w-8 mx-auto" />
                  <Skeleton className="h-3.5 sm:h-5 w-10 sm:w-12 mx-auto" />
                </div>
                <div className="bg-background/50 rounded-md sm:rounded-lg px-2 py-1 sm:px-3 sm:py-2 flex-1 space-y-1 sm:space-y-2">
                  <Skeleton className="h-2 w-6 sm:w-8 mx-auto" />
                  <Skeleton className="h-3.5 sm:h-5 w-10 sm:w-12 mx-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
