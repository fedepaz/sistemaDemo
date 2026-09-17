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
  PROGRAMACION_SIEMBRA: "/programacion-siembra",
  SIEMBRA_PARTIDAS_REGISTRADAS: "/programacion-siembra/partidas-registradas",
  SUSTRATOS: "/sustratos",
  MEZCLAS: "/mezclas",
  A_SEMBRAR: "/a-sembrar",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
