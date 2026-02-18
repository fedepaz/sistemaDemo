// src/features/permissions/components/permission-row-item.tsx

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";
import { PermissionScope, TablePermission } from "@vivero/shared";
import {
  LucideIcon,
  Sprout,
  Warehouse,
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
} from "lucide-react";

export type PermissionRow = {
  tableName: string;
} & TablePermission;

const SCOPE_LABELS: Record<PermissionScope, { label: string; desc: string }> = {
  NONE: { label: "Ninguno", desc: "Sin acceso a registros" },
  OWN: { label: "Propios", desc: "Solo registros creados por el usuario" },
  ALL: { label: "Todos", desc: "Todos los registros de la tabla" },
};

const TABLE_META: Record<string, { label: string; icon: LucideIcon }> = {
  plants: { label: "Plantas", icon: Sprout },
  greenhouses: { label: "Invernaderos", icon: Warehouse },
  reports: { label: "Reportes", icon: FileBarChart },
  clients: { label: "Clientes", icon: UserCheck },
  orders: { label: "Pedidos", icon: Package },
  pests: { label: "Plagas", icon: Bug },
  irrigation: { label: "Riego", icon: Droplets },
  lighting: { label: "Iluminaci\u00f3n", icon: Sun },
  climate: { label: "Clima", icon: Thermometer },
  tasks: { label: "Tareas", icon: ClipboardList },
};

function getTableMeta(tableName: string) {
  return (
    TABLE_META[tableName] ?? {
      label: tableName.charAt(0).toUpperCase() + tableName.slice(1),
      icon: Shield,
    }
  );
}

const CRUD_COLUMNS = [
  { key: "canRead" as const, label: "Leer", icon: Eye, color: "text-blue-500" },
  {
    key: "canCreate" as const,
    label: "Crear",
    icon: Plus,
    color: "text-emerald-500",
  },
  {
    key: "canUpdate" as const,
    label: "Editar",
    icon: Pencil,
    color: "text-amber-500",
  },
  {
    key: "canDelete" as const,
    label: "Eliminar",
    icon: Trash2,
    color: "text-red-500",
  },
] as const;

export function PermissionRowItem({
  row,
  originalRow,
  onToggleCrud,
  onScopeChange,
}: {
  row: PermissionRow;
  originalRow: PermissionRow;
  onToggleCrud: (
    tableName: string,
    key: keyof Pick<
      PermissionRow,
      "canCreate" | "canRead" | "canUpdate" | "canDelete"
    >,
  ) => void;
  onScopeChange: (tableName: string, scope: PermissionScope) => void;
}) {
  const meta = getTableMeta(row.tableName);
  const Icon = meta.icon;

  const isDirty =
    row.canCreate !== originalRow.canCreate ||
    row.canRead !== originalRow.canRead ||
    row.canUpdate !== originalRow.canUpdate ||
    row.canDelete !== originalRow.canDelete ||
    row.scope !== originalRow.scope;

  const activeCrudCount = [
    row.canRead,
    row.canCreate,
    row.canUpdate,
    row.canDelete,
  ].filter(Boolean).length;

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 rounded-lg border px-4 py-4 transition-all lg:flex-row lg:items-center",
        isDirty
          ? "border-primary/30 bg-primary/[0.03]"
          : "border-transparent bg-muted/30 hover:bg-muted/50",
      )}
    >
      {/* Dirty indicator */}
      {isDirty && (
        <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-primary" />
      )}

      {/* Resource label */}
      <div className="flex min-w-0 items-center gap-3 lg:w-48 lg:shrink-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">
            {meta.label}
          </span>
          <span className="text-xs text-muted-foreground">{row.tableName}</span>
        </div>
      </div>

      {/* CRUD switches */}
      <div className="flex flex-1 items-center gap-6 pl-12 lg:gap-8 lg:pl-0">
        {CRUD_COLUMNS.map((col) => {
          const isActive = row[col.key];
          const wasChanged = row[col.key] !== originalRow[col.key];
          return (
            <Tooltip key={col.key}>
              <TooltipTrigger asChild>
                <label className="flex cursor-pointer flex-col items-center gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <col.icon
                      className={cn(
                        "h-3.5 w-3.5 transition-colors",
                        isActive ? col.color : "text-muted-foreground/40",
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-medium transition-colors",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground/60",
                      )}
                    >
                      {col.label}
                    </span>
                  </div>
                  <Switch
                    checked={isActive}
                    onCheckedChange={() => onToggleCrud(row.tableName, col.key)}
                    className={cn(
                      "h-5 w-9 data-[state=checked]:bg-primary",
                      wasChanged &&
                        "ring-2 ring-primary/20 ring-offset-1 ring-offset-background",
                    )}
                    aria-label={`${col.label} - ${meta.label}`}
                  />
                </label>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">
                  {isActive ? "Desactivar" : "Activar"}{" "}
                  {col.label.toLowerCase()} en {meta.label}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Scope selector */}
      <div className="flex items-center gap-3 pl-12 lg:pl-0">
        <Separator orientation="vertical" className="hidden h-8 lg:block" />
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Alcance
          </span>
          <ToggleGroup
            type="single"
            value={row.scope}
            onValueChange={(val) => {
              if (val) onScopeChange(row.tableName, val as PermissionScope);
            }}
            variant="outline"
            size="sm"
            className="gap-0 rounded-lg border bg-muted/50 p-0.5"
          >
            {(["NONE", "OWN", "ALL"] as const).map((scope) => (
              <Tooltip key={scope}>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value={scope}
                    className={cn(
                      "h-7 rounded-md border-0 px-3 text-xs font-medium transition-all",
                      "data-[state=off]:bg-transparent data-[state=off]:text-muted-foreground",
                      row.scope === scope &&
                        scope === "ALL" &&
                        "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
                      row.scope === scope &&
                        scope === "OWN" &&
                        "data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground",
                      row.scope === scope &&
                        scope === "NONE" &&
                        "data-[state=on]:bg-muted data-[state=on]:text-foreground",
                    )}
                    aria-label={`Alcance ${SCOPE_LABELS[scope].label} - ${meta.label}`}
                  >
                    {SCOPE_LABELS[scope].label}
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">{SCOPE_LABELS[scope].desc}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </ToggleGroup>
        </div>
      </div>

      {/* Active count badge */}
      <div className="absolute right-4 top-4 lg:static lg:ml-auto lg:shrink-0">
        <Badge
          variant={activeCrudCount > 0 ? "default" : "secondary"}
          className={cn(
            "h-6 min-w-6 justify-center text-xs font-semibold tabular-nums",
            activeCrudCount === 4 &&
              "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20",
            activeCrudCount > 0 &&
              activeCrudCount < 4 &&
              "bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20",
            activeCrudCount === 0 && "bg-muted text-muted-foreground",
          )}
        >
          {activeCrudCount}/4
        </Badge>
      </div>
    </div>
  );
}
