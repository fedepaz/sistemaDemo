"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CompanyWelcomeSkeleton() {
  return (
    <Card className="h-full border-0 shadow-sm bg-card overflow-hidden">
      <CardContent className="p-0">
        {/* Main Welcome Section */}
        <div className="flex flex-col items-center justify-center py-12 px-8">
          {/* Logo Skeleton */}
          <Skeleton className="h-32 sm:h-40 md:h-48 w-64 rounded-lg" />

          {/* Tagline Skeleton */}
          <Skeleton className="h-6 w-72 mt-6" />

          {/* Badges Skeleton */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Skeleton className="h-10 w-40 rounded-full" />
            <Skeleton className="h-10 w-36 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
