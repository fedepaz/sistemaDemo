// src/lib/config/navigations.ts

import { ROUTES } from "@/constants/routes";
import {
  Home,
  ClipboardList,
  Users,
  Sprout,
  Layers,
  Building2,
  Briefcase,
  Expand,
  Shield,
  Package,
} from "lucide-react";
import type { NavigationConfig } from "./navigation.types";

export const NAVIGATION_CONFIG: NavigationConfig = [
  {
    kind: "standalone",
    title: "Home",
    href: ROUTES.DASHBOARD,
    icon: Home,
    description: "Vista general y alertas",
  },

  {
    kind: "nestedGroup",
    id: "partidas",
    title: "Partidas",
    icon: Layers,
    items: [
      {
        title: "Siembra",
        href: ROUTES.SIEMBRA,
        icon: Sprout,
        description: "Gestión de partidas a siembrar",
        dashboard: { statsLabel: "Partidas a siembrar" },
        requiredPermission: { table: "siembra", action: "read" },
      },
      {
        title: "A Extender",
        href: ROUTES.EXTENDIDOS,
        icon: Expand,
        description: "Gestión de partidas a extender",
        dashboard: { statsLabel: "Partidas a extender" },
        requiredPermission: { table: "extendidos", action: "read" },
      },
      {
        kind: "subGroup",
        id: "sustratos",
        title: "Sustratos",
        icon: Package,
        items: [
          {
            title: "Lista",
            href: ROUTES.SUSTRATOS,
            icon: Package,
            description: "Gestión de sustratos",
            dashboard: { statsLabel: "Sustratos" },
            requiredPermission: { table: "sustratos", action: "read" },
          },
        ],
      },
    ],
  },

  {
    kind: "nestedGroup",
    id: "usuarios",
    title: "Usuarios",
    icon: Users,
    items: [
      {
        title: "Lista",
        href: ROUTES.USERS,
        icon: Users,
        description: "Gestión de usuarios del sistema",
        dashboard: { statsLabel: "Usuarios activos" },
        requiredPermission: { table: "users", action: "read" },
      },
      {
        title: "Permisos",
        href: ROUTES.USER_PERMISSIONS,
        icon: Shield,
        description: "Configuración de permisos por usuario",
        dashboard: { statsLabel: "Permisos configurados" },
        requiredPermission: {
          table: "user_permissions",
          action: "read",
        },
      },
    ],
  },
  {
    kind: "nestedGroup",
    id: "dev",
    title: "Desarrollo",
    icon: Briefcase,
    items: [
      {
        title: "Auditoría",
        href: ROUTES.AUDIT_LOGS,
        icon: ClipboardList,
        description: "Registro de actividades del sistema",
        dashboard: { statsLabel: "Registros de auditoría" },
        requiredPermission: { table: "audit_logs", action: "read" },
      },
      {
        title: "Entidades",
        href: ROUTES.ENTITIES,
        icon: Building2,
        description: "Gestión de entidades del sistema",
        dashboard: { statsLabel: "Entidades activas" },
        requiredPermission: { table: "entities", action: "read" },
      },
    ],
  },
];
