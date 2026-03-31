// apps/frontend/src/features/permissions/constants/table-meta.ts

import {
  LucideIcon,
  FileBarChart,
  UserCheck,
  Package,
  Bug,
  Droplets,
  Sun,
  Thermometer,
  ClipboardList,
  Shield,
  Eye,
  Pencil,
  Plus,
  Trash2,
  Building2,
  Globe,
  List,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import { PermissionScope } from "@vivero/shared";

export const TABLE_META: Record<string, { icon: LucideIcon }> = {
  // Enterprise Resources
  entities: { icon: Package },
  facilities: { icon: Building2 },
  reports: { icon: FileBarChart },
  clients: { icon: UserCheck },
  orders: { icon: Package },
  incidents: { icon: Bug },
  resources: { icon: Droplets },
  energy: { icon: Sun },
  environment: { icon: Thermometer },
  tasks: { icon: ClipboardList },
  extendidos: { icon: Package },
  agentes: { icon: UserCheck },

  // System Resources
  audit_logs: { icon: Shield },
  enums: { icon: List },
  messages: { icon: MessageSquare },
  tenants: { icon: Building2 },
  users: { icon: Users },
  user_permissions: { icon: Shield },
  user_preferences: { icon: Settings },
  locales: { icon: Globe },
};

export function getTableMeta(tableName: string, labelFromDb?: string) {
  const meta = TABLE_META[tableName];
  return {
    label:
      labelFromDb ||
      tableName
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" "),
    icon: meta?.icon ?? Bug,
  };
}

export const SCOPE_LABELS: Record<
  PermissionScope,
  { label: string; desc: string }
> = {
  NONE: { label: "Ninguno", desc: "Sin acceso a registros" },
  OWN: { label: "Propios", desc: "Solo registros creados por el usuario" },
  ALL: { label: "Todos", desc: "Todos los registros de la tabla" },
};

export const CRUD_COLUMNS = [
  { key: "canRead" as const, label: "Leer", icon: Eye, color: "text-primary" },
  {
    key: "canCreate" as const,
    label: "Crear",
    icon: Plus,
    color: "text-primary",
  },
  {
    key: "canUpdate" as const,
    label: "Editar",
    icon: Pencil,
    color: "text-accent-foreground",
  },
  {
    key: "canDelete" as const,
    label: "Eliminar",
    icon: Trash2,
    color: "text-destructive",
  },
] as const;
