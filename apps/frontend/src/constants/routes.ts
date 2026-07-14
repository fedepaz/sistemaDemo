// src/constants/routes.ts
export const ROUTES = {
  DASHBOARD: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  USERS: "/users",
  USER_PERMISSIONS: "/user-permissions",
  AUDIT_LOGS: "/audit-logs",
  ENTITIES: "/entities",
  EXTENDIDOS: "/extendidos",
  SIEMBRA: "/siembra",
  ALERTS_V1: "/alerts/v1",
  ALERTS_V2: "/alerts/v2",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
