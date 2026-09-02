// apps/frontend/src/lib/queryKeys.ts
// Centralized query key factories for the entire application.
// All query keys should be defined here to ensure consistency and enable
// centralized cache invalidation.

// ============================================================================
// AUTH (current user session)
// ============================================================================

export const authProfileQueryKeys = {
  all: ["authProfile"] as const,
  me: () => [...authProfileQueryKeys.all, "me"] as const,
};

export const authPermissionsQueryKeys = {
  all: ["authPermissions"] as const,
  me: () => [...authPermissionsQueryKeys.all, "me"] as const,
};

// ============================================================================
// USERS (admin CRUD)
// ============================================================================

export const usersQueryKeys = {
  all: () => ["users"] as const,
  byUserName: (username: string) =>
    [...usersQueryKeys.all(), "byUserName", username] as const,
  byTenantId: (tenantId: string) =>
    [...usersQueryKeys.all(), "byTenantId", tenantId] as const,
  admin: () => [...usersQueryKeys.all(), "allAdmin"] as const,
  toActivate: () => [...usersQueryKeys.all(), "toActivate"] as const,
};

// ============================================================================
// PERMISSIONS (admin CRUD)
// ============================================================================

export const adminPermissionsQueryKeys = {
  tables: () => ["permissions", "tables"] as const,
  table: (tableName: string) =>
    [...adminPermissionsQueryKeys.tables(), tableName] as const,
  byUserId: (userId: string) =>
    [...adminPermissionsQueryKeys.tables(), "user", userId] as const,
  byEntityId: (entityId: string) =>
    [...adminPermissionsQueryKeys.tables(), "entity", entityId] as const,
};

// ============================================================================
// ENTITIES
// ============================================================================

export const entityQueryKeys = {
  all: () => ["entities"] as const,
  byName: (name: string) => [...entityQueryKeys.all(), "byName", name] as const,
  byLabel: (label: string) =>
    [...entityQueryKeys.all(), "byLabel", label] as const,
};

// ============================================================================
// AUDIT LOGS
// ============================================================================

export const auditLogQueryKeys = {
  all: () => ["auditLog"] as const,
  byTenantName: (tenantName: string, page?: number, limit?: number) =>
    ["auditLog", tenantName, page, limit] as const,
  byUserId: (userId: string) => ["auditLog", "user", userId] as const,
};

// ============================================================================
// DASHBOARD
// ============================================================================

export const kpiQueryKeys = {
  all: () => ["kpi"] as const,
  lists: () => [...kpiQueryKeys.all(), "lists"] as const,
};

export const alertQueryKeys = {
  all: () => ["alerts"] as const,
  lists: () => [...alertQueryKeys.all(), "lists"] as const,
};

export const forecastKpiQueryKeys = {
  all: () => ["forecastKPI"] as const,
  lists: () => [...forecastKpiQueryKeys.all(), "lists"] as const,
};

export const configQueryKeys = {
  all: () => ["l-config"] as const,
};

// ============================================================================
// EXTENDIDOS
// ============================================================================

export const extendidosQueryKeys = {
  all: () => ["extendidos"] as const,
  enCamara: () => [...extendidosQueryKeys.all(), "enCamara"] as const,
  fechas: () => [...extendidosQueryKeys.all(), "fechas"] as const,
  byFecha: (fecha: string) =>
    [...extendidosQueryKeys.all(), "byFecha", fecha] as const,
};

// ============================================================================
// SUSTRATOS
// ============================================================================

export const sustratoQueryKeys = {
  all: () => ["sustratos"] as const,
};

// ============================================================================
// MEZCLAS
// ============================================================================

export const mezclaQueryKeys = {
  all: () => ["mezclas"] as const,
};

// ============================================================================
// DEPOSITOS
// ============================================================================

export const depositosQueryKeys = {
  all: () => ["depositos"] as const,
  byCamara: () => [...depositosQueryKeys.all(), "byCamara"] as const,
  byCodigo: (codigo: number) =>
    [...depositosQueryKeys.all(), "byCodigo", codigo] as const,
};

// ============================================================================
// SIEMBRA
// ============================================================================

export const siembraQueryKeys = {
  all: () => ["siembra"] as const,
  partidas: () => [...siembraQueryKeys.all(), "partidas"] as const,
  tratamientos: () => [...siembraQueryKeys.all(), "tratamientos"] as const,
};

// ============================================================================
// ALERTS
// ============================================================================

export const alertsQueryKeys = {
  all: () => ["alerts"] as const,
  byType: (type: string) => [...alertsQueryKeys.all(), type] as const,
};

export const alertCommentsQueryKeys = {
  all: () => ["alertComments"] as const,
  byPartida: (
    alertType: string,
    partidaId: number,
    anio: number,
    indice: number,
  ) =>
    [
      ...alertCommentsQueryKeys.all(),
      alertType,
      partidaId,
      anio,
      indice,
    ] as const,
};

// ============================================================================
// TASK SHIFTS
// ============================================================================

export const taskShiftQueryKeys = {
  all: () => ["taskShifts"] as const,
  byEntityId: (entityId: string) =>
    [...taskShiftQueryKeys.all(), "byEntityId", entityId] as const,
};

// ============================================================================
// ALERT SOLVED
// ============================================================================

export const alertsSolvedQueryKeys = {
  all: () => ["alertsSolved"] as const,
};
