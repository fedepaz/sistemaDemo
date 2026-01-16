export const ROUTES = {
  DASHBOARD: "/[locale]/dashboard",
  PLANTS: "/[locale]/dashboard/plants",
  LOGIN: "/[locale]/login",
  SIGNUP: "/[locale]/signup",
} as const;

export type Routes = (typeof ROUTES)[keyof typeof ROUTES];
