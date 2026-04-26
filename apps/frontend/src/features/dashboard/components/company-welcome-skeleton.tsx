"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CompanyWelcomeSkeleton() {
  return (
    <Card className="h-full border-0 shadow-sm bg-card overflow-hidden">
      <CardContent className="p-0">
        {/* Main Welcome Section */}
        <div className="flex flex-col items-center justify-center py-8 sm:py-16 px-8 min-h-[180px] sm:min-h-[400px]">
          {/* Logo Skeleton */}
          <Skeleton className="h-20 sm:h-40 md:h-48 w-48 sm:w-64 rounded-lg" />

          {/* Tagline Skeleton - Hidden on mobile to match real component */}
          <Skeleton className="h-6 w-72 mt-6 hidden sm:block" />

          {/* Badges Skeleton */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4 sm:mt-8">
            <Skeleton className="h-6 w-24 sm:h-10 sm:w-40 rounded-full" />
            <Skeleton className="h-6 w-24 sm:h-10 sm:w-36 rounded-full" />
            <Skeleton className="h-6 w-24 sm:h-10 sm:w-32 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
