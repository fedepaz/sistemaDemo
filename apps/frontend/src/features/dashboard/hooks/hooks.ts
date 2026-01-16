//src/features/dashboard/hooks/hooks.ts

import { useSuspenseQuery } from "@tanstack/react-query";
import { mockDashboardService } from "../api/mockDashboardService";

export const KPI_QUERY_KEY = {
  all: "kpi" as const,
  lists: () => [...KPI_QUERY_KEY.all, "lists"] as const,
};

export const ALERT_QUERY_KEY = {
  all: "alerts" as const,
  lists: () => [...ALERT_QUERY_KEY.all, "lists"] as const,
};

export const RECENT_ACTIVITY_QUERY_KEY = {
  all: "recentActivity" as const,
  lists: () => [...RECENT_ACTIVITY_QUERY_KEY.all, "lists"] as const,
};

export const useDashboardKPIs = () => {
  return useSuspenseQuery({
    queryKey: KPI_QUERY_KEY.lists(),
    queryFn: mockDashboardService.fetchKPIs,
  });
};

export const useDashboardAlerts = () => {
  return useSuspenseQuery({
    queryKey: ALERT_QUERY_KEY.lists(),
    queryFn: mockDashboardService.fetchAlerts,
  });
};

export const useDashboardRecentActivity = () => {
  return useSuspenseQuery({
    queryKey: RECENT_ACTIVITY_QUERY_KEY.lists(),
    queryFn: mockDashboardService.fetchRecentActivity,
  });
};
