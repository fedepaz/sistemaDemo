// src/features/dashboard/components/company-info-card-skeleton.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function CompanyInfoCardSkeleton() {
  return (
    <Card className="h-full border-0 shadow-sm bg-card overflow-hidden">
      <CardContent className="p-0">
        {/* Header Skeleton */}
        <div className="p-8 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-3/4 mx-auto sm:mx-0" />
              <Skeleton className="h-4 w-1/2 mx-auto sm:mx-0" />
              <div className="flex justify-center sm:justify-start gap-2 pt-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Content Skeleton */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            {/* Left Column */}
            <div className="space-y-4">
              <Skeleton className="h-3 w-32" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 py-3">
                  <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <Skeleton className="h-3 w-32" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 py-3">
                  <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
