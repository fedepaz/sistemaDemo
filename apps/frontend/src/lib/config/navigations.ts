// src/lib/config/navigations.ts

import { ROUTES } from "@/constants/routes";
import {
  Home,
  Settings,
  BarChart3,
  Key,
  UserCircle,
  Package,
  Briefcase,
} from "lucide-react";
import type { NavigationConfig } from "./navigation.types";

export const NAVIGATION_CONFIG: NavigationConfig = [
  {
    kind: "standalone",
    title: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: Home,
    description: "Vista general y alertas",
  },

  {
    kind: "group",
    id: "operations",
    title: "Operaciones",
    icon: Briefcase,
    items: [
      {
        title: "Siembra",
        href: ROUTES.SIEMBRA,
        icon: Package,
        description: "Gestión de partidas a siembrar",
        dashboard: { statsLabel: "Partidas a siembrar" },
        requiredPermission: { table: "siembra", action: "read" },
      },
      {
        title: "A Extender",
        href: ROUTES.EXTENDIDOS,
        icon: Package,
        description: "Gestión de partidas a extender",
        dashboard: { statsLabel: "Partidas a extender" },
        requiredPermission: { table: "extendidos", action: "read" },
      },
    ],
  },

  {
    kind: "nestedGroup",
    id: "admin",
    title: "Administración",
    icon: Settings,
    items: [
      {
        kind: "subGroup",
        id: "usuarios",
        title: "Usuarios",
        items: [
          {
            title: "Lista",
            href: ROUTES.USERS,
            icon: UserCircle,
            description: "Gestión de usuarios del sistema",
            dashboard: { statsLabel: "Usuarios activos" },
            requiredPermission: { table: "users", action: "read" },
          },
          {
            title: "Permisos",
            href: ROUTES.USER_PERMISSIONS,
            icon: Key,
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
        title: "Auditoría",
        href: ROUTES.AUDIT_LOGS,
        icon: BarChart3,
        description: "Registro de actividades del sistema",
        dashboard: { statsLabel: "Registros de auditoría" },
        requiredPermission: { table: "audit_logs", action: "read" },
      },
      {
        title: "Entidades",
        href: ROUTES.ENTITIES,
        icon: Package,
        description: "Gestión de entidades del sistema",
        dashboard: { statsLabel: "Entidades activas" },
        requiredPermission: { table: "entities", action: "read" },
      },
    ],
  },
];
