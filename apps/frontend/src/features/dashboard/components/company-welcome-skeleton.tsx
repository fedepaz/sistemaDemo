"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CompanyWelcomeSkeleton() {
  return (
    <Card className="border-0 shadow-sm bg-card overflow-hidden">
      <CardContent className="p-0">
        {/* Main Welcome Section */}
        <div className="flex flex-col items-center justify-center py-6 sm:py-10 px-6 min-h-[140px] sm:min-h-[250px]">
          {/* Logo Skeleton */}
          <Skeleton className="h-16 sm:h-28 md:h-32 w-40 sm:w-56 rounded-lg" />

          {/* Tagline Skeleton - Hidden on mobile to match real component */}
          <Skeleton className="h-4 w-48 mt-4 hidden sm:block" />
        </div>
      </CardContent>
    </Card>
  );
}
