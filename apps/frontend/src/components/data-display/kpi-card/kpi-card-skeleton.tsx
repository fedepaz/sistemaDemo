// app/components/data-display/kpi-card/kpi-card-skeleton.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function KPICardSkeleton() {
  return (
    <Card data-testid="kpi-card-skeleton">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <Skeleton className="h-4 w-12 rounded-md" />
        </CardTitle>
        <Skeleton className="h-4 w-8 rounded-md" />
      </CardHeader>
      <CardContent>
        <div className="h-4 w-32 rounded-md" />
        <div className="h-2 w-32 rounded-md" />
      </CardContent>
    </Card>
  );
}
