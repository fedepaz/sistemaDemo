//src/features/dashboard/components/RootDashboard.tsx
"use client";

import { Suspense } from "react";
import DashboardKPI from "./dashboard-kpi";
import FeatureNavigation from "./feature-navigation";
import DashboardAlerts from "./dashboard-alerts";
import { DashboardKPISkeleton } from "./dashboard-kpi-skeleton";
import { FeatureNavigationSkeleton } from "./feature-navigation-skeleton";
import { DashboardAlertsSkeleton } from "./dashboard-alerts-skeleton";

export function RootDashboard() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-2 py-2 space-y-8">
      <div className="shrink-0">
        <Suspense fallback={<DashboardKPISkeleton />}>
          <DashboardKPI />
        </Suspense>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        <div className="lg:col-span-3 min-h-0 overflow-auto">
          <Suspense fallback={<FeatureNavigationSkeleton />}>
            <FeatureNavigation />
          </Suspense>
        </div>
        <div className="lg:col-span-1 min-h-0 overflow-auto">
          <Suspense fallback={<DashboardAlertsSkeleton />}>
            <DashboardAlerts />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
