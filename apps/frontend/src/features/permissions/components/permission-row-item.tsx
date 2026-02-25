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
} from "@/components/ui/tooltip";
import { PermissionScope, TablePermission } from "@vivero/shared";
import { Shield } from "lucide-react";
import { memo } from "react";
import {
  CRUD_COLUMNS,
  getTableMeta,
  SCOPE_LABELS,
} from "../constants/table-meta";
import { usePermission } from "@/hooks/usePermission";

export type PermissionRow = {
  tableName: string;
} & TablePermission;

export const PermissionRowItem = memo(function PermissionRowItem({
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

  const dataTablePermissions = usePermission("user_permissions");

  const canEdit = dataTablePermissions.canUpdate;

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-6 rounded-xl border p-5 transition-all lg:flex-row lg:items-center lg:gap-4",
        isDirty
          ? "border-primary/40 bg-primary/[0.04] shadow-sm"
          : "border-border/50 bg-muted/30 hover:bg-muted/50",
      )}
    >
      {/* Dirty indicator */}
      {isDirty ? (
        <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
      ) : null}

      {/* Resource label */}
      <div className="flex items-center gap-4 lg:w-52 lg:shrink-0">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm border border-border/50">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-semibold text-foreground truncate">
            {meta.label}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
            {row.tableName}
          </span>
        </div>
      </div>

      {/* CRUD switches or Status View */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4 lg:flex lg:flex-1 lg:items-center lg:gap-8 lg:px-4">
        {CRUD_COLUMNS.map((col) => {
          const isActive = row[col.key];
          const wasChanged = row[col.key] !== originalRow[col.key];

          if (!canEdit) {
            return (
              <div
                key={col.key}
                className="flex flex-col items-center gap-2 px-2"
              >
                <div className="flex items-center gap-2">
                  <col.icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? col.color : "text-muted-foreground/20",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      isActive ? "text-foreground" : "text-muted-foreground/30",
                    )}
                  >
                    {col.label}
                  </span>
                </div>
                <div className="flex h-11 items-center justify-center">
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all",
                      isActive
                        ? "border-primary/20 bg-primary/5 text-primary"
                        : "border-muted-foreground/10 bg-muted/30 text-muted-foreground/20",
                    )}
                  >
                    {isActive ? (
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    ) : (
                      <div className="h-0.5 w-2 rounded-full bg-current" />
                    )}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Tooltip key={col.key}>
              <TooltipTrigger asChild>
                <label className="flex cursor-pointer flex-col items-center gap-1 group/switch">
                  <div className="flex items-center gap-3">
                    <col.icon
                      className={cn(
                        "h-4 w-4 transition-all duration-300",
                        isActive
                          ? col.color
                          : "text-muted-foreground/30 group-hover/switch:text-muted-foreground/50",
                      )}
                    />
                  </div>
                  <div className="flex h-11 items-center justify-center">
                    {" "}
                    {/* Minimum touch target height */}
                    <Switch
                      checked={isActive}
                      onCheckedChange={() =>
                        onToggleCrud(row.tableName, col.key)
                      }
                      disabled={!canEdit}
                      className={cn(
                        "h-6 w-11 data-[state=checked]:bg-primary",
                        wasChanged
                          ? "ring-4 ring-primary/10 ring-offset-0 ring-offset-background"
                          : "",
                      )}
                      aria-label={col.label}
                    />
                  </div>
                </label>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-popover border border-border shadow-md text-foreground px-3 py-1.5 rounded-md" // ✅ Padding + color explícito
                sideOffset={5}
              >
                <p className="text-xs font-medium">
                  {canEdit
                    ? isActive
                      ? "Desactivar"
                      : "Activar"
                    : isActive
                      ? "Activado"
                      : "Desactivado"}{" "}
                  {col.label.toLowerCase()}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Scope selector or Status Badge */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <Separator orientation="vertical" className="hidden h-10 lg:block" />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-muted-foreground/70" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Alcance de datos
            </span>
          </div>

          {!canEdit ? (
            <div className="flex h-9 items-center">
              <Badge
                variant="outline"
                className={cn(
                  "h-8 rounded-lg px-4 text-[11px] font-bold uppercase tracking-widest border-2",
                  row.scope === "ALL" &&
                    "border-primary/20 bg-primary/5 text-primary shadow-sm",
                  row.scope === "OWN" &&
                    "border-primary/20 bg-primary/5 text-primary shadow-sm",
                  row.scope === "NONE" &&
                    "border-muted-foreground/10 bg-muted/20 text-muted-foreground/60",
                )}
              >
                {SCOPE_LABELS[row.scope].label}
              </Badge>
            </div>
          ) : (
            <ToggleGroup
              type="single"
              value={row.scope}
              onValueChange={(val) => {
                if (val) onScopeChange(row.tableName, val as PermissionScope);
              }}
              disabled={!canEdit}
              variant="outline"
              className="flex w-full overflow-hidden rounded-xl border bg-muted/40 p-1 lg:w-auto"
            >
              {(["NONE", "OWN", "ALL"] as const).map((scope) => (
                <Tooltip key={scope}>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value={scope}
                      className={cn(
                        "flex-1 h-9 rounded-lg border-0 px-4 text-xs font-semibold transition-all duration-200 lg:flex-none",
                        "data-[state=off]:bg-transparent data-[state=off]:text-muted-foreground hover:bg-muted",
                        row.scope === scope && scope === "ALL"
                          ? "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground shadow-sm"
                          : "",
                        row.scope === scope && scope === "OWN"
                          ? "data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:border-primary/20 shadow-sm dark:data-[state=on]:bg-primary/20 dark:data-[state=on]:text-primary-foreground"
                          : "",
                        row.scope === scope && scope === "NONE"
                          ? "data-[state=on]:bg-muted-foreground/10 data-[state=on]:text-muted-foreground shadow-sm"
                          : "",
                      )}
                      aria-label={`Alcance ${SCOPE_LABELS[scope].label} - ${meta.label}`}
                    >
                      {SCOPE_LABELS[scope].label}
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="bg-popover border border-border shadow-md text-foreground px-3 py-1.5 rounded-md" // ✅ Padding + color explícito
                  >
                    <p className="text-xs font-medium">
                      {SCOPE_LABELS[scope].desc}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </ToggleGroup>
          )}
        </div>
      </div>

      {/* Active count badge */}
      <div className="absolute right-5 top-5 lg:static lg:ml-auto lg:shrink-0">
        <Badge
          variant={activeCrudCount > 0 ? "default" : "secondary"}
          className={cn(
            "h-7 min-w-[2.5rem] justify-center text-[11px] font-bold tabular-nums rounded-full shadow-sm transition-all",
            activeCrudCount === 4
              ? "bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground"
              : "",
            activeCrudCount > 0 && activeCrudCount < 4
              ? "bg-accent/10 text-accent-foreground border border-accent/20 dark:bg-accent/20 dark:text-accent-foreground"
              : "",
            activeCrudCount === 0
              ? "bg-muted text-muted-foreground/60 border-transparent"
              : "",
          )}
        >
          {activeCrudCount}/4
        </Badge>
      </div>
    </div>
  );
});
