// packages/shared/src/constants/managed-entities.ts

export const MANAGED_ENTITIES = {
  USER: {
    tableName: "users",
    label: "Usuarios",
    permissionType: "PROCESS" as const,
  },
  USER_PERMISSION: {
    tableName: "user_permissions",
    label: "Permisos",
    permissionType: "CRUD" as const,
  },
  EXTENDIDO: {
    tableName: "extendidos",
    label: "Extendidos",
    permissionType: "CRUD" as const,
  },
  AGENTES: {
    tableName: "agentes",
    label: "Agentes de Venta",
    permissionType: "READ_ONLY" as const,
  },
  TENANTS: {
    tableName: "tenants",
    label: "Tenants",
    permissionType: "PROCESS" as const,
  },
} as const;

export const MANAGED_ENTITY_ARRAY = Object.values(MANAGED_ENTITIES);
export type ManagedEntityKey = keyof typeof MANAGED_ENTITIES;
export type ManagedTableName =
  (typeof MANAGED_ENTITIES)[ManagedEntityKey]["tableName"];
export type PermissionType =
  (typeof MANAGED_ENTITIES)[ManagedEntityKey]["permissionType"];

export const ALLOWED_TABLE_NAMES = MANAGED_ENTITY_ARRAY.map(
  (e) => e.tableName,
) as [ManagedTableName, ...ManagedTableName[]];
