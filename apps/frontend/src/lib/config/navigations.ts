// src/lib/config/navigations.ts

import { ROUTES } from "@/constants/routes";
import {
  Home,
  Settings,
  ClipboardList,
  Users,
  Sprout,
  Layers,
  Building2,
  Briefcase,
  Expand,
  Shield,
  Bell,
  TableProperties,
  Sparkles,
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
    id: "alerts",
    title: "Alertas",
    icon: Bell,
    items: [
      {
        kind: "subGroup",
        id: "alerts-views",
        title: "Vistas",
        icon: Layers,
        items: [
          {
            title: "Tablero",
            href: ROUTES.ALERTS_V1,
            icon: TableProperties,
            description: "Vista de tablas de datos",
            dashboard: { statsLabel: "Alertas en tabla" },
            requiredPermission: { table: "alerts", action: "read" },
          },
          {
            title: "Interactivo",
            href: ROUTES.ALERTS_V2,
            icon: Sparkles,
            description: "Vista interactiva con tarjetas",
            dashboard: { statsLabel: "Alertas interactivas" },
            requiredPermission: { table: "alerts", action: "read" },
          },
        ],
      },
    ],
  },

  {
    kind: "nestedGroup",
    id: "operations",
    title: "Operaciones",
    icon: Briefcase,
    items: [
      {
        kind: "subGroup",
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
        ],
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
