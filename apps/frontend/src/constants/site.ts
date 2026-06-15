export const SITE_CONFIG = {
  name: "AgriManage",
  description: "Professional agricultural plant management dashboard",
  author: "cincoOesteDesarrollos",
  url: "https://proplanta-sistema.ar/",
  image: "developing",
  twitter: "developing",
  github: "developing",
} as const;

export type SiteConfig = (typeof SITE_CONFIG)[keyof typeof SITE_CONFIG];
