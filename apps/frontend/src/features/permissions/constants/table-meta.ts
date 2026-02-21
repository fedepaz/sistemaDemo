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

export const TABLE_META: Record<string, { label: string; icon: LucideIcon }> = {
  // Enterprise Resources
  entities: { label: "Entidades", icon: Package },
  facilities: { label: "Instalaciones", icon: Building2 },
  reports: { label: "Reportes", icon: FileBarChart },
  clients: { label: "Clientes", icon: UserCheck },
  orders: { label: "Pedidos", icon: Package },
  incidents: { label: "Incidencias", icon: Bug },
  resources: { label: "Recursos", icon: Droplets },
  energy: { label: "Energía", icon: Sun },
  environment: { label: "Ambiente", icon: Thermometer },
  tasks: { label: "Tareas", icon: ClipboardList },

  // System Resources
  audit_logs: { label: "Logs de Auditoría", icon: Shield },
  enums: { label: "Enumerados", icon: List },
  messages: { label: "Mensajes", icon: MessageSquare },
  tenants: { label: "Tenants", icon: Building2 },
  users: { label: "Usuarios", icon: Users },
  user_permissions: { label: "Permisos", icon: Shield },
  user_preferences: { label: "Preferencias", icon: Settings },
  locales: { label: "Locales", icon: Globe },
};

export function getTableMeta(tableName: string) {
  return (
    TABLE_META[tableName] ?? {
      label: tableName
        .split("_")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" "),
      icon: Shield,
    }
  );
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
