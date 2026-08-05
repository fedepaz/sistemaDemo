// src/features/alerts/index.ts

// Types
export type { AlertType } from "./types";

// Config
export { ALERT_TYPE_CONFIGS } from "./components/v1/alert-type-config";
export type { AlertTypeConfig } from "./components/v1/alert-type-config";

// Shared Components
export { AlertSummaryCards } from "./components/shared/alert-summary-cards";
export { AlertDashboardSkeleton } from "./components/shared/alert-dashboard-skeleton";

// v1 Components
export { AlertsDashboardV1 } from "./components/v1/AlertsDashboardV1";

// Hooks
export {
  useSiembraRetrasada,
  useFaltaGerminacion,
  useFaltantePlantas,
  useFaltaPreExpedicion,
} from "./hooks/useAlerts";
export { useHasAlerts } from "./hooks/useHasAlerts";
export { useAlertComments } from "./hooks/useAlertComments";
export { useAlertCommentsMutation } from "./hooks/useAlertCommentsMutation";

// Services
export { alertService } from "./api/alertService";
export { alertCommentsService } from "./api/alertCommentsService";
