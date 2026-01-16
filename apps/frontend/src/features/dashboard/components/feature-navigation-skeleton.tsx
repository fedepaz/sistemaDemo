// src/features/dashboard/components/feature-navigation-skeleton.tsx

import { FeatureCardSkeleton } from "@/components/data-display/feature-card";

export function FeatureNavigationSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <FeatureCardSkeleton key={i} />
      ))}
    </div>
  );
}
