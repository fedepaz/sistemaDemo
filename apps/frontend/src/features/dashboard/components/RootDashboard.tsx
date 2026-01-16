//src/features/dashboard/components/RootDashboard.tsx
"use client";

import { Suspense } from "react";
import DashboardKPI from "./dashboard-kpi";
import FeatureNavigation from "./feature-navigation";
import DashboardAlerts from "./dashboard-alerts";
import RecentActivity from "./recent-activity";
import { DashboardKPISkeleton } from "./dashboard-kpi-skeleton";
import { FeatureNavigationSkeleton } from "./feature-navigation-skeleton";
import { DashboardAlertsSkeleton } from "./dashboard-alerts-skeleton";
import { RecentActivitySkeleton } from "./recent-activity-skeleton";

export function RootDashboard() {
  return (
    <>
      <Suspense fallback={<DashboardKPISkeleton />}>
        <DashboardKPI />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<FeatureNavigationSkeleton />}>
            <FeatureNavigation />
          </Suspense>
        </div>
        <div className="space-y-6">
          <Suspense fallback={<DashboardAlertsSkeleton />}>
            <DashboardAlerts />
          </Suspense>
          <Suspense fallback={<RecentActivitySkeleton />}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>
    </>
  );
}
