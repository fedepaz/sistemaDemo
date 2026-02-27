// src/features/dashboard/components/root-dashboard-skeleton.tsx

import { DashboardKPISkeleton } from "./dashboard-kpi-skeleton";
import { FeatureNavigationSkeleton } from "./feature-navigation-skeleton";
import { DashboardAlertsSkeleton } from "./dashboard-alerts-skeleton";

export function RootDashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-2 py-2 space-y-8">
      {/* Top: KPI Skeleton */}
      <div className="shrink-0">
        <DashboardKPISkeleton />
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        <div className="lg:col-span-3 min-h-0 overflow-auto">
          <FeatureNavigationSkeleton />
        </div>
        <div className="lg:col-span-1 min-h-0 overflow-auto">
          <DashboardAlertsSkeleton />
        </div>
      </div>
    </div>
  );
}
