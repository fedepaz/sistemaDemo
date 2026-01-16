// app/components/data-display/feature-card/feature-card-skeleton.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FeatureCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Skeleton className="h-6 w-6" />
          </div>
          <Skeleton className="h-5 w-8 rounded-md" />
        </div>
        <CardTitle className="mt-4">
          <Skeleton className="h-4 w-16 rounded-md" />
        </CardTitle>
        <Skeleton className="h-4 w-32 rounded-md" />
      </CardHeader>
      <CardContent>
        <div className="h-4 w-32 rounded-md" />
        <div className="h-2 w-32 rounded-md" />
      </CardContent>
    </Card>
  );
}
