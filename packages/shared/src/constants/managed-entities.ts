// packages/shared/src/constants/managed-entities.ts

export const MANAGED_ENTITIES = {
  USER: { tableName: "users", label: "Usuarios" },
  TENANT: { tableName: "tenants", label: "Tenantes" },
  AUDIT_LOG: { tableName: "audit_logs", label: "Logs de Auditoría" },
  USER_PERMISSION: { tableName: "user_permissions", label: "Permisos" },
  EXTENDIDO: { tableName: "extendidos", label: "Extendidos" },
} as const;

export type ManagedEntityKey = keyof typeof MANAGED_ENTITIES;
export type ManagedTableName =
  (typeof MANAGED_ENTITIES)[ManagedEntityKey]["tableName"];

export const ALLOWED_TABLE_NAMES = Object.values(MANAGED_ENTITIES).map(
  (e) => e.tableName,
) as [ManagedTableName, ...ManagedTableName[]];
