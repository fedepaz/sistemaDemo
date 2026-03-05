// src/constants/routes.ts
export const ROUTES = {
  DASHBOARD: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  USERS: "/users",
  USER_PERMISSIONS: "/user-permissions",
  TENANTS: "/tenants",
  AUDIT_LOGS: "/audit-logs",
  EXTENDIDOS: "/extendidos",
  CLIENTS: "/clients",
  INVOICES: "/invoices",
  PURCHASE_ORDERS: "/purchase-orders",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
