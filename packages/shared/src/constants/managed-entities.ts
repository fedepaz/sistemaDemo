// packages/shared/src/constants/managed-entities.ts

export const MANAGED_ENTITIES = {
  USER: { tableName: "users", label: "Usuarios" },
  USER_PERMISSION: { tableName: "user_permissions", label: "Permisos" },
  TENANT: { tableName: "tenants", label: "Empresas" },
  EXTENDIDO: { tableName: "extendidos", label: "Extendidos" },
  AUDIT_LOG: { tableName: "audit_logs", label: "Logs de Auditoría" },
  AGENTES: { tableName: "agentes", label: "Agentes de Venta" },
} as const;

export type ManagedEntityKey = keyof typeof MANAGED_ENTITIES;
export type ManagedTableName =
  (typeof MANAGED_ENTITIES)[ManagedEntityKey]["tableName"];

export const ALLOWED_TABLE_NAMES = Object.values(MANAGED_ENTITIES).map(
  (e) => e.tableName,
) as [ManagedTableName, ...ManagedTableName[]];
