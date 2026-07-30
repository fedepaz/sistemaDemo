// src/features/entities/index.ts

// Components
export { EntityDashboard } from "./components/EntityDashboard";
export { EntityDashboardSkeleton } from "./components/entity-dashboard-skeleton";
export { EntitiesKPIs } from "./components/entities-kpi";

// Hooks
export { useEntities, useCreateEntity, useDeleteEntity } from "./hooks/useEntities";

// Services
export { entityService } from "./api/entityService";
