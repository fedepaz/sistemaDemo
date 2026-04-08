// src/lib/config/navigations.ts

import { ROUTES } from "@/constants/routes";
import {
  Home,
  Settings,
  BarChart3,
  Key,
  UserCircle,
  Package,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType;
  description?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  dashboard?: {
    statsLabel: string; // e.g., "Entidades activas"
    // Note: Actual stats value will come from KPIs hook
  };
  requiredPermission?: {
    table: string; // must match Prisma @@map name
    action: "read"; // for visibility, we only care about read
  };
}

export interface NavigationGroup {
  id: string;
  title: string;
  icon: React.ComponentType;
  items: NavigationItem[];
}

export const NAVIGATION_CONFIG: NavigationGroup[] = [
  {
    id: "operations",
    title: "Operaciones",
    icon: Home,
    items: [
      {
        title: "Dashboard",
        href: ROUTES.DASHBOARD,
        icon: Home,
        description: "Vista general y alertas",
      },
      {
        title: "Extendidos",
        href: ROUTES.EXTENDIDOS,
        icon: Package,
        description: "Gestión de extendidos",
        dashboard: { statsLabel: "Extendidos operativos" },
        requiredPermission: { table: "extendidos", action: "read" },
      },
    ],
  },

  {
    id: "admin",
    title: "Administración",
    icon: Settings,
    items: [
      {
        title: "Usuarios",
        href: ROUTES.USERS,
        icon: UserCircle,
        description: "Gestión de usuarios del sistema",
        dashboard: { statsLabel: "Usuarios activos" },
        requiredPermission: { table: "users", action: "read" },
      },
      {
        title: "Permisos de Usuario",
        href: ROUTES.USER_PERMISSIONS,
        icon: Key,
        description: "Configuración de permisos por usuario",
        dashboard: { statsLabel: "Permisos configurados" },
        requiredPermission: { table: "user_permissions", action: "read" },
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
