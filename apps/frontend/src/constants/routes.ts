export const ROUTES = {
  DASHBOARD: "/",
  PLANTS: "/plants",
  LOGIN: "/login",
} as const;

export type Routes = (typeof ROUTES)[keyof typeof ROUTES];
