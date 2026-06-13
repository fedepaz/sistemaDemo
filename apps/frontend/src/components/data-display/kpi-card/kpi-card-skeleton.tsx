// app/components/data-display/kpi-card/kpi-card-skeleton.tsx

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function KPICardSkeleton() {
  return (
    <Card className="overflow-hidden" data-testid="kpi-card-skeleton">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 py-2">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-3.5 w-3.5 rounded-full" />
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 space-y-1">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-2 w-24" />
      </CardContent>
    </Card>
  );
}
