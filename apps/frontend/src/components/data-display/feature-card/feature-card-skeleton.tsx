// app/components/data-display/feature-card/feature-card-skeleton.tsx

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FeatureCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <Skeleton className="h-6 w-6" />
          </div>
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        <CardTitle className="mt-4">
          <Skeleton className="h-5 w-[120px] sm:w-[150px]" />
        </CardTitle>
        <div className="space-y-2 mt-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[80%]" />
        </div>
      </CardHeader>
    </Card>
  );
}
