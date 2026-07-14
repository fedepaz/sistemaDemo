// src/features/alerts/index.ts

// Shared Components
export { AlertSummaryCards } from "./components/shared/alert-summary-cards";
export { AlertDashboardSkeleton } from "./components/shared/alert-dashboard-skeleton";
export { FilterTabs } from "./components/shared/filter-tabs";
export type { AlertTab } from "./components/shared/filter-tabs";

// v1 Components
export { AlertsDashboardV1 } from "./components/v1/AlertsDashboardV1";

// v2 Components
export { AlertsDashboardV2 } from "./components/v2/AlertsDashboardV2";

// Hooks
export {
  useSiembraRetrasada,
  useFaltaGerminacion,
  useFaltantePlantas,
  useFaltaPreExpedicion,
} from "./hooks/useAlerts";
export { useAlertActions } from "./hooks/useAlertActions";

// Services
export { alertService } from "./api/alertService";
