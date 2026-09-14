//src/features/dashboard/components/RootDashboard.tsx
"use client";

import DashboardKPI from "./dashboard-kpi";
import DashboardAlerts from "./dashboard-alerts";
import { DashboardKPISkeleton } from "./dashboard-kpi-skeleton";
import { DashboardAlertsSkeleton } from "./dashboard-alerts-skeleton";
import CompanyWelcome from "./company-welcome";
import { CompanyWelcomeSkeleton } from "./company-welcome-skeleton";
import { LoadingBoundary } from "@/components/common/loading-boundary";

export function RootDashboard() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-1 space-y-3 sm:space-y-4">
      <div className="shrink-0">
        <LoadingBoundary skeleton={<DashboardKPISkeleton />}>
          <DashboardKPI />
        </LoadingBoundary>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        <div className="lg:col-span-3 min-h-0 overflow-auto">
          <LoadingBoundary skeleton={<CompanyWelcomeSkeleton />}>
            <CompanyWelcome />
          </LoadingBoundary>
        </div>
        <div className="lg:col-span-1 min-h-0 overflow-auto">
          <LoadingBoundary skeleton={<DashboardAlertsSkeleton />}>
            <DashboardAlerts />
          </LoadingBoundary>
        </div>
      </div>
    </div>
  );
}
