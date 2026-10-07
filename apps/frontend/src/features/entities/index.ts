// src/features/entities/index.ts

// Components
export { EntityDashboard } from "./components/EntityDashboard";
export { EntitiesKPIs } from "./components/entities-kpi";

// Hooks
export { useEntities, useCreateEntity, useUpdateEntity, useDeleteEntity } from "./hooks/useEntities";

// Services
export { entityService } from "./api/entityService";
