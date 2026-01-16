// src/features/dashboard/components/dashboard-kpi-skeleton.tsx

import { KPICardSkeleton } from "@/components/data-display/kpi-card";

export function DashboardKPISkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>
  );
}
