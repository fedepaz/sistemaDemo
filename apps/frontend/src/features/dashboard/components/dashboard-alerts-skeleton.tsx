// src/features/dashboard/components/dashboard-alerts-skeleton.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardAlertsSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col">
      {/* Header Skeleton */}
      <div className="bg-primary/20 px-3 py-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2 w-8" />
            </div>
          </div>
          <Skeleton className="h-3 w-12" />
        </div>
      </div>

      <CardContent className="p-2 flex-1 overflow-auto">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted/30 rounded-lg p-2 flex-1 flex flex-col justify-center"
            >
              {/* Currency Header Skeleton */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>

              {/* Buy/Sell Rates Skeleton */}
              <div className="flex gap-1.5">
                <div className="bg-background/50 rounded px-2 py-1 flex-1 space-y-1">
                  <Skeleton className="h-2 w-8 mx-auto" />
                  <Skeleton className="h-4 w-12 mx-auto" />
                </div>
                <div className="bg-background/50 rounded px-2 py-1 flex-1 space-y-1">
                  <Skeleton className="h-2 w-8 mx-auto" />
                  <Skeleton className="h-4 w-12 mx-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
