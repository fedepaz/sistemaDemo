// src/features/permissions/components/permissions-manager.tsx
"use client";

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
  Building2,
  Globe,
  List,
  MessageSquare,
  Settings,
  Bug,
  ClipboardList,
  Droplets,
  FileBarChart,
  Package,
  Sprout,
  Sun,
  Thermometer,
  UserCheck,
  Warehouse,
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
import { PermissionRowItem } from "./permission-row-item";
import { PermissionScope, TablePermission } from "@vivero/shared";
import { useUsers } from "@/features/users/hooks/usersHooks";

import {
  useSetUserPermissions,
  useTables,
  useUserPermissions,
} from "../hooks/permsHooks";

// ── Table name metadata ──
const TABLE_META = {
  // Agricultural Resources
  plants: { label: "Plantas", icon: Sprout },
  greenhouses: { label: "Invernaderos", icon: Warehouse },
  reports: { label: "Reportes", icon: FileBarChart },
  clients: { label: "Clientes", icon: UserCheck },
  orders: { label: "Pedidos", icon: Package },
  pests: { label: "Plagas", icon: Bug },
  irrigation: { label: "Riego", icon: Droplets },
  lighting: { label: "Iluminación", icon: Sun },
  climate: { label: "Clima", icon: Thermometer },
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
} as const;

function getTableMeta(tableName: string) {
  const meta = TABLE_META[tableName as keyof typeof TABLE_META];
  return (
    meta || {
      label: tableName
        .split("_")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" "),
      icon: Shield,
    }
  );
}

const CRUD_COLUMNS = [
  { key: "canRead" as const, label: "Leer", icon: Eye, color: "text-sky-600" },
  {
    key: "canCreate" as const,
    label: "Crear",
    icon: Plus,
    color: "text-emerald-600",
  },
  {
    key: "canUpdate" as const,
    label: "Editar",
    icon: Pencil,
    color: "text-amber-600",
  },
  {
    key: "canDelete" as const,
    label: "Eliminar",
    icon: Trash2,
    color: "text-rose-600",
  },
] as const;

interface PermissionsManagerProps {
  userId: string;
  userInitials: string;
}

function PermissionsManager({ userId, userInitials }: PermissionsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  // Track ONLY what changed relative to original data
  const [localChanges, setLocalChanges] = useState<
    Record<string, TablePermission>
  >({});

  const { data: tables = [] } = useTables();
  const { data: userPermissions = {}, isLoading: isLoadingUserPerms } =
    useUserPermissions(userId);
  const { mutate: savePermissions, isPending: isSaving } =
    useSetUserPermissions();

  // The actual state is the merge of original + changes
  const localPermissions = useMemo(() => {
    return tables.map((tableName) => {
      // If we have a local change, use it. Otherwise use original data or defaults.
      if (localChanges[tableName]) {
        return { tableName, ...localChanges[tableName] };
      }

      const perms = userPermissions[tableName] || {
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
        scope: "NONE" as const,
      };

      return {
        tableName,
        ...perms,
      };
    });
  }, [userPermissions, tables, localChanges]);

  // For checking if anything changed
  const isDirty = useMemo(
    () => Object.keys(localChanges).length > 0,
    [localChanges],
  );
  const changedCount = useMemo(
    () => Object.keys(localChanges).length,
    [localChanges],
  );

  // Handlers
  const handleToggleCrud = useCallback(
    (
      tableName: string,
      key: keyof Pick<
        TablePermission,
        "canCreate" | "canRead" | "canUpdate" | "canDelete"
      >,
    ) => {
      setLocalChanges((prev) => {
        const current = prev[tableName] ||
          userPermissions[tableName] || {
            canCreate: false,
            canRead: false,
            canUpdate: false,
            canDelete: false,
            scope: "NONE" as const,
          };

        const next = { ...current, [key]: !current[key] };

        // If next is identical to original, we could remove it from changes,
        // but for simplicity we just keep it.
        return { ...prev, [tableName]: next };
      });
    },
    [userPermissions],
  );

  const handleScopeChange = useCallback(
    (tableName: string, scope: PermissionScope) => {
      setLocalChanges((prev) => {
        const current = prev[tableName] ||
          userPermissions[tableName] || {
            canCreate: false,
            canRead: false,
            canUpdate: false,
            canDelete: false,
            scope: "NONE" as const,
          };

        return { ...prev, [tableName]: { ...current, scope } };
      });
    },
    [userPermissions],
  );

  const handleDiscard = useCallback(() => {
    setLocalChanges({});
  }, []);

  const handleSave = useCallback(() => {
    if (!userId || !isDirty) return;

    // Convert current state to what the API expects
    savePermissions(
      { userId, permissions: localPermissions },
      {
        onSuccess: () => {
          setLocalChanges({});
        },
      },
    );
  }, [userId, localPermissions, isDirty, savePermissions]);

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

  return (
    <>
      <Separator className="opacity-50" />

      {/* ── Permissions board ── */}
      <CardContent className="p-0 bg-background">
        {tables.length === 0 && !isLoadingUserPerms ? (
          <EmptyState hasUser />
        ) : (
          <div className="flex flex-col">
            {/* Search + column headers */}
            <div className="sticky top-0 z-10 flex flex-col gap-4 border-b bg-background/95 backdrop-blur-md px-6 py-4 lg:flex-row lg:items-center">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Filtrar por nombre de tabla o recurso..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 border-border/60 bg-muted/20 pl-10 text-sm shadow-none transition-all focus:bg-background focus:ring-primary/20 rounded-xl"
                />
              </div>
            </div>

            {/* Rows */}
            <ScrollArea className="flex flex-col bg-muted/5">
              <div className="flex flex-col gap-3 p-6">
                {filteredRows.length === 0 && !isLoadingUserPerms ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Search className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      No hay coincidencias
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No encontramos ningún recurso que coincida con &quot;
                      {searchQuery}&quot;
                    </p>
                  </div>
                ) : (
                  filteredRows.map((row) => {
                    const originalRow = userPermissions[row.tableName] || {
                      canCreate: false,
                      canRead: false,
                      canUpdate: false,
                      canDelete: false,
                      scope: "NONE" as const,
                    };
                    return (
                      <PermissionRowItem
                        key={row.tableName}
                        row={row}
                        originalRow={{
                          tableName: row.tableName,
                          ...originalRow,
                        }}
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
      {tables.length > 0 && (
        <>
          <Separator className="opacity-50" />
          <CardFooter className="flex flex-col gap-4 items-center justify-between px-6 py-6 bg-muted/5 sm:flex-row">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  isDirty
                    ? "bg-primary animate-pulse"
                    : "bg-muted-foreground/20",
                )}
              />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {isDirty
                  ? `${changedCount} ${changedCount === 1 ? "cambio pendiente" : "cambios pendientes"}`
                  : "Estado actualizado"}
              </p>
            </div>
            <div className="flex items-center gap-1 ">
              <Button
                variant="outline"
                size="lg"
                onClick={handleDiscard}
                disabled={!isDirty}
                className="flex-1 gap-2 rounded-xl border-border/60 hover:bg-background sm:flex-none font-bold text-xs uppercase tracking-widest"
              >
                <RotateCcw className="h-4 w-4" />
                Descartar
              </Button>
              <Button
                size="lg"
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                className="flex-1 gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 sm:flex-none font-bold text-xs uppercase tracking-widest"
              >
                {isSaving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar cambios
              </Button>
            </div>
          </CardFooter>
        </>
      )}
    </>
  );
}

export function PermissionsDashboard() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: users = [], isLoading: isLoadingUsers } = useUsers();

  const selectedUser = useMemo(() => {
    if (!users) return null;
    return users.find((u) => u.id === selectedUserId);
  }, [users, selectedUserId]);

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
      <Card className="w-full overflow-hidden border-border/60 shadow-md transition-all hover:shadow-lg">
        {/* ── Header ── */}
        <CardHeader className="pb-6 bg-muted/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shadow-sm border border-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold tracking-tight">
                  Gestionar permisos
                </CardTitle>
                <CardDescription className="text-sm">
                  Configura los niveles de acceso por recurso para cada usuario
                  de la plataforma
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <Separator className="opacity-50" />

        {/* ── User selector ── */}
        <div className="px-6 py-6 bg-background">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <div className="space-y-1.5 lg:flex-1">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
                <Users className="h-3.5 w-3.5" />
                Seleccionar Usuario
              </label>
              <Select
                value={selectedUserId ?? ""}
                onValueChange={handleUserChange}
                disabled={isLoadingUsers}
              >
                <SelectTrigger className="w-full h-11 rounded-xl bg-muted/30 border-border/60 transition-all hover:bg-muted/50 focus:ring-primary/20 lg:max-w-md">
                  <SelectValue
                    placeholder={
                      isLoadingUsers
                        ? "Cargando usuarios..."
                        : "Elige un usuario para empezar"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl">
                  {users?.map((user) => {
                    const initials =
                      [user.firstName?.[0], user.lastName?.[0]]
                        .filter(Boolean)
                        .join("")
                        .toUpperCase() ||
                      user.username[0]?.toUpperCase() ||
                      "U";
                    const displayName =
                      [user.firstName, user.lastName]
                        .filter(Boolean)
                        .join(" ") || user.username;
                    return (
                      <SelectItem
                        key={user.id}
                        value={user.id}
                        className="rounded-lg my-1"
                      >
                        <div className="flex items-center gap-3 py-1">
                          <Avatar className="h-8 w-8 border border-border/50">
                            <AvatarFallback className="bg-primary/5 text-xs font-bold text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">
                              {displayName}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              @{user.username}
                            </span>
                          </div>
                          {!user.isActive && (
                            <Badge
                              variant="secondary"
                              className="h-4 text-[9px] ml-auto uppercase tracking-tighter"
                            >
                              Inactivo
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {!selectedUserId ? (
          <div className="border-t border-dashed bg-muted/5">
            <EmptyState hasUser={false} />
          </div>
        ) : (
          <PermissionsManager
            key={selectedUserId}
            userId={selectedUserId}
            userInitials={userInitials}
          />
        )}
      </Card>
    </TooltipProvider>
  );
}
