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
import { PermissionRow, PermissionRowItem } from "./permission-row-item";
import { PermissionScope, TablePermission } from "@vivero/shared";
import { useUsers } from "@/features/users/hooks/usersHooks";

import {
  useSetUserPermissions,
  useTables,
  useUserPermissions,
} from "../hooks/permsHooks";

// ── Table name metadata ──
const TABLE_META = {
  audit_logs: { label: "Logs de Auditoría", icon: Shield },
  enums: { label: "Enumerados", icon: List },
  messages: { label: "Mensajes", icon: MessageSquare },
  tenants: { label: "Tenants", icon: Building2 },
  users: { label: "Usuarios", icon: Users },
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

interface PermissionsManagerProps {
  userId: string;
  userInitials: string;
}

function PermissionsManager({ userId, userInitials }: PermissionsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  // Track ONLY what changed relative to original data
  const [localChanges, setLocalChanges] = useState<Record<string, TablePermission>>({});

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
  const isDirty = useMemo(() => Object.keys(localChanges).length > 0, [localChanges]);
  const changedCount = useMemo(() => Object.keys(localChanges).length, [localChanges]);

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
        const current = prev[tableName] || userPermissions[tableName] || {
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
        const current = prev[tableName] || userPermissions[tableName] || {
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
      {/* Selected user summary header */}
      <div className="flex items-center gap-4 px-6 pb-4">
        {isDirty && (
          <Badge
            variant="outline"
            className="shrink-0 border-primary/30 bg-primary/5 text-primary"
          >
            {changedCount} {changedCount === 1 ? "cambio" : "cambios"}{" "}
            pendiente{changedCount !== 1 ? "s" : ""}
          </Badge>
        )}
        <div className="ml-auto flex items-center gap-2">
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
      </div>

      <Separator />

      {/* ── Permissions board ── */}
      <CardContent className="p-0">
        {tables.length === 0 && !isLoadingUserPerms ? (
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
                {filteredRows.length === 0 && !isLoadingUserPerms ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">
                      No se encontraron recursos para &quot;{searchQuery}
                      &quot;
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
                        originalRow={{ tableName: row.tableName, ...originalRow }}
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
                disabled={!isDirty || isSaving}
                className="gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                Guardar permisos
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
          </div>
        </div>

        {!selectedUserId ? (
          <>
            <Separator />
            <EmptyState hasUser={false} />
          </>
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
