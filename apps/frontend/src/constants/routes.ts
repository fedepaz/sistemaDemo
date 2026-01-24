// src/constants/routes.ts
export const ROUTES = {
  DASHBOARD: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  CLIENTS: "/clients",
  INVOICES: "/invoices",
  PLANTS: "/plants",
  PURCHASE_ORDERS: "/purchase-orders",
  USERS: "/users",
  AUDIT_LOGS: "/audit-logs",
  ENUMS: "/enums",
  MESSAGE: "/message",
  TENANTS: "/tenants",
  USER_PERMISSIONS: "/user-permissions",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
