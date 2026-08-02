//src/features/dashboard/hooks/hooks.ts

import { useSuspenseQuery } from "@tanstack/react-query";
import { dashboardService } from "../api/dashboardService";
import { kpiQueryKeys, alertQueryKeys, forecastKpiQueryKeys } from "@/lib/queryKeys";

export const useDashboardKPIs = () => {
  return useSuspenseQuery({
    queryKey: kpiQueryKeys.lists(),
    queryFn: dashboardService.fetchKPIs,
  });
};

export const useForecastKPIs = () => {
  return useSuspenseQuery({
    queryKey: forecastKpiQueryKeys.lists(),
    queryFn: dashboardService.fetchForecastKPIs,
  });
};

export const useDashboardAlerts = () => {
  return useSuspenseQuery({
    queryKey: alertQueryKeys.lists(),
    queryFn: dashboardService.fetchAlerts,
  });
};
