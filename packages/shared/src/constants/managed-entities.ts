// packages/shared/src/constants/managed-entities.ts

export const MANAGED_ENTITIES = {
  USER: { tableName: "users", label: "Usuarios", permissionType: "PROCESS" },
  USER_PERMISSION: {
    tableName: "user_permissions",
    label: "Permisos",
    permissionType: "CRUD",
  },
  EXTENDIDO: {
    tableName: "extendidos",
    label: "Extendidos",
    permissionType: "CRUD",
  },
  AGENTES: {
    tableName: "agentes",
    label: "Agentes de Venta",
    permissionType: "READ_ONLY",
  },
  TENANTS: {
    tableName: "tenants",
    label: "Tenants",
    permissionType: "READ_ONLY",
  },
} as const;

export type ManagedEntityKey = keyof typeof MANAGED_ENTITIES;
export type ManagedTableName =
  (typeof MANAGED_ENTITIES)[ManagedEntityKey]["tableName"];

export const ALLOWED_TABLE_NAMES = Object.values(MANAGED_ENTITIES).map(
  (e) => e.tableName,
) as [ManagedTableName, ...ManagedTableName[]];
