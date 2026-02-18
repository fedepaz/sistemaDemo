// src/features/permissions/components/permissions-manager.tsx
"use client";

import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import {
  Shield,
  Save,
  RotateCcw,
  Eye,
  Plus,
  Pencil,
  Trash2,
  Users,
  Search,
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
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EmptyState } from "./empty-state";
import { PermissionRow, PermissionRowItem } from "./permission-row-item";
import { PermissionScope } from "@vivero/shared";
import { useUsers } from "@/features/users/hooks/usersHooks";
import { usePermissions } from "@/features/auth/hooks/use-permissions";

// ── Types ──

// ── Table name metadata ──

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

// ── Scope label helpers ──

// ── CRUD column config ──

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

// ── Permission row component ──

// ── Empty state ──

// ── Loading skeleton ──

// ── Main component ──

export function PermissionsDashboard() {
  const { data: users, isLoading: isLoadingUsers } = useUsers();
  const { data: permissions, isLoading: isLoadingPermissions } =
    usePermissions();
  const [localPermissions, setLocalPermissions] = useState<PermissionRow[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<
    PermissionRow[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Sync local state when permissions prop changes
  React.useEffect(() => {
    if (!permissions) return;
    const permissionsArray: PermissionRow[] = Object.entries(permissions).map(
      ([tableName, values]) => ({
        tableName,
        ...values,
      }),
    );
    setLocalPermissions(permissionsArray);
    setOriginalPermissions(permissionsArray);
  }, [permissions]);

  // Find selected user

  const selectedUser = useMemo(() => {
    if (!users) return null;
    return users.find((u) => u.id === selectedUserId);
  }, [users, selectedUserId]);

  // Filter rows by search
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return localPermissions;
    const q = searchQuery.toLowerCase();
    return localPermissions.filter((row) => {
      const meta = getTableMeta(row.tableName);
      return (
        meta.label.toLowerCase().includes(q) ||
        row.tableName.toLowerCase().includes(q)
      );
    });
  }, [localPermissions, searchQuery]);

  // Dirty state
  const isDirty = useMemo(() => {
    if (localPermissions.length !== originalPermissions.length) return true;
    return localPermissions.some((row) => {
      const orig = originalPermissions.find(
        (o) => o.tableName === row.tableName,
      );
      if (!orig) return true;
      return (
        row.canCreate !== orig.canCreate ||
        row.canRead !== orig.canRead ||
        row.canUpdate !== orig.canUpdate ||
        row.canDelete !== orig.canDelete ||
        row.scope !== orig.scope
      );
    });
  }, [localPermissions, originalPermissions]);

  const changedCount = useMemo(() => {
    return localPermissions.filter((row) => {
      const orig = originalPermissions.find(
        (o) => o.tableName === row.tableName,
      );
      if (!orig) return true;
      return (
        row.canCreate !== orig.canCreate ||
        row.canRead !== orig.canRead ||
        row.canUpdate !== orig.canUpdate ||
        row.canDelete !== orig.canDelete ||
        row.scope !== orig.scope
      );
    }).length;
  }, [localPermissions, originalPermissions]);

  // Handlers
  const handleToggleCrud = useCallback(
    (
      tableName: string,
      key: keyof Pick<
        PermissionRow,
        "canCreate" | "canRead" | "canUpdate" | "canDelete"
      >,
    ) => {
      setLocalPermissions((prev) =>
        prev.map((row) =>
          row.tableName === tableName ? { ...row, [key]: !row[key] } : row,
        ),
      );
    },
    [],
  );

  const handleScopeChange = useCallback(
    (tableName: string, scope: PermissionScope) => {
      setLocalPermissions((prev) =>
        prev.map((row) =>
          row.tableName === tableName ? { ...row, scope } : row,
        ),
      );
    },
    [],
  );

  const handleDiscard = useCallback(() => {
    setLocalPermissions(originalPermissions.map((p) => ({ ...p })));
  }, [originalPermissions]);

  const handleSave = useCallback(() => {
    console.log(localPermissions);
  }, [localPermissions]);

  const handleUserChange = useCallback((userId: string) => {
    setSelectedUserId(userId);
  }, []);

  // Get initials for selected user
  const userInitials = selectedUser
    ? [selectedUser.firstName?.[0], selectedUser.lastName?.[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase() ||
      selectedUser.username[0]?.toUpperCase() ||
      "U"
    : "";

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="w-full overflow-hidden">
        {/* ── Header ── */}
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Gestionar permisos</CardTitle>
                <CardDescription>
                  Configura los permisos de acceso por recurso para cada usuario
                </CardDescription>
              </div>
            </div>
            {isDirty && (
              <Badge
                variant="outline"
                className="shrink-0 border-primary/30 bg-primary/5 text-primary"
              >
                {changedCount} {changedCount === 1 ? "cambio" : "cambios"}{" "}
                pendiente{changedCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardHeader>

        <Separator />

        {/* ── User selector ── */}
        <div className="px-6 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Users className="h-4 w-4 text-muted-foreground" />
              Usuario
            </label>
            <Select
              value={selectedUserId ?? ""}
              onValueChange={handleUserChange}
              disabled={isLoadingUsers}
            >
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue
                  placeholder={
                    isLoadingUsers
                      ? "Cargando usuarios..."
                      : "Seleccionar usuario"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => {
                  const initials =
                    [user.firstName?.[0], user.lastName?.[0]]
                      .filter(Boolean)
                      .join("")
                      .toUpperCase() ||
                    user.username[0]?.toUpperCase() ||
                    "U";
                  const displayName =
                    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
                    user.username;
                  return (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{displayName}</span>
                        <span className="text-muted-foreground">
                          @{user.username}
                        </span>
                        {!user.isActive && (
                          <Badge variant="secondary" className="h-4 text-[9px]">
                            Inactivo
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Selected user summary */}
            {selectedUser &&
              !isLoadingPermissions &&
              localPermissions.length > 0 && (
                <div className="ml-auto hidden items-center gap-2 sm:flex">
                  <Avatar className="h-7 w-7 border border-border">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {localPermissions.length}{" "}
                    {localPermissions.length === 1 ? "recurso" : "recursos"}{" "}
                    configurados
                  </span>
                </div>
              )}
          </div>
        </div>

        <Separator />

        {/* ── Permissions board ── */}
        <CardContent className="p-0">
          {!selectedUserId ? (
            <EmptyState hasUser={false} />
          ) : localPermissions.length === 0 ? (
            <EmptyState hasUser />
          ) : (
            <div className="flex flex-col">
              {/* Search + column headers */}
              <div className="flex items-center gap-4 border-b bg-muted/20 px-6 py-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Filtrar recursos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 border-none bg-transparent pl-8 text-sm shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
                  {CRUD_COLUMNS.map((col) => (
                    <Tooltip key={col.key}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          <col.icon className={cn("h-3 w-3", col.color)} />
                          <span>{col.label}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          Permiso de {col.label.toLowerCase()}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Rows */}
              <ScrollArea className="max-h-[480px]">
                <div className="flex flex-col gap-2 p-4">
                  {filteredRows.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-sm text-muted-foreground">
                        No se encontraron recursos para &quot;{searchQuery}
                        &quot;
                      </p>
                    </div>
                  ) : (
                    filteredRows.map((row) => {
                      const orig =
                        originalPermissions.find(
                          (o) => o.tableName === row.tableName,
                        ) ?? row;
                      return (
                        <PermissionRowItem
                          key={row.tableName}
                          row={row}
                          originalRow={orig}
                          onToggleCrud={handleToggleCrud}
                          onScopeChange={handleScopeChange}
                        />
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>

        {/* ── Footer ── */}
        {selectedUserId && localPermissions.length > 0 && (
          <>
            <Separator />
            <CardFooter className="flex items-center justify-between px-6 py-4">
              <p className="text-xs text-muted-foreground">
                {isDirty
                  ? `${changedCount} ${changedCount === 1 ? "recurso modificado" : "recursos modificados"}`
                  : "Sin cambios pendientes"}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDiscard}
                  disabled={!isDirty}
                  className="gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Descartar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!isDirty}
                  className="gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  Guardar permisos
                </Button>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </TooltipProvider>
  );
}
