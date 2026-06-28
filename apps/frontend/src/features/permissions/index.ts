// src/features/permissions/index.ts

// Components
export { PermissionsDashboard } from "./components/PermissionsDashboard";
export { PermissionsDashboardSkeleton } from "./components/permission-dashboard-skeleton";

// Hooks
export {
  useTables,
  useTableByName,
  useUserPermissions,
  useEntityPermissions,
  useSetUserPermissions,
} from "./hooks/permsHooks";

// Services
export { permissionService } from "./api/permissionService";
