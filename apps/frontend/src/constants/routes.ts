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
  SUSTRATOS: "/sustratos",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
