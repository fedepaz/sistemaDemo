//src/features/dashboard/components/RootDashboard.tsx
"use client";

import { Suspense } from "react";
import DashboardKPI from "./dashboard-kpi";
import DashboardAlerts from "./dashboard-alerts";
import { DashboardKPISkeleton } from "./dashboard-kpi-skeleton";
import { DashboardAlertsSkeleton } from "./dashboard-alerts-skeleton";
import CompanyWelcome from "./company-welcome";
import { CompanyWelcomeSkeleton } from "./company-welcome-skeleton";

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
          <Suspense fallback={<CompanyWelcomeSkeleton />}>
            <CompanyWelcome />
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
