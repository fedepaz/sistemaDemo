//src/features/permissions/components/permissions-manager.tsx

import {
  PermissionScope,
  PermissionType,
  TablePermission,
} from "@vivero/shared";
import { useCallback, useMemo, useState } from "react";
import {
  useSetUserPermissions,
  useTables,
  useUserPermissions,
} from "../hooks/permsHooks";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, RotateCcw, Save, Shield } from "lucide-react";
import { EmptyState } from "./empty-state";
import { PermissionRowItem } from "./permission-row-item";
import { usePermission } from "@/hooks/usePermission";
import { Badge } from "@/components/ui/badge";

interface PermissionsManagerProps {
  userId: string;
}

export function PermissionsUserManager({ userId }: PermissionsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  // Track ONLY what changed relative to original data
  const [localChanges, setLocalChanges] = useState<
    Record<string, TablePermission>
  >({});

  const { data: tables = [] } = useTables();
  const { data: userPermissions = {} } = useUserPermissions(userId);
  const { mutate: savePermissions, isPending: isSaving } =
    useSetUserPermissions();

  const dataTablePermissions = usePermission("user_permissions");
  const canEdit = dataTablePermissions.canUpdate;

  // The actual state is the merge of original + changes
  const localPermissions = useMemo(() => {
    return tables.map((table) => {
      // ← era tableName
      const key = table.name; // ← usar name como key
      const perms = localChanges[key] ||
        userPermissions[key] || {
          canCreate: false,
          canRead: false,
          canUpdate: false,
          canDelete: false,
          scope: "ALL" as const,
          permissionType: table.permissionType, // ← viene de la entity, no hardcodeado
        };

      return {
        tableName: key,
        label: table.label,
        permissionType: table.permissionType,
        canCreate: perms.canCreate,
        canRead: perms.canRead,
        canUpdate: perms.canUpdate,
        canDelete: perms.canDelete,
        scope: perms.scope,
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
        const current =
          prev[tableName] ||
          userPermissions[tableName] ||
          ({
            canCreate: false,
            canRead: false,
            canUpdate: false,
            canDelete: false,
            scope: "ALL" as const,
            permissionType: "CRUD" as const,
          } as TablePermission);

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
        const current =
          prev[tableName] ||
          userPermissions[tableName] ||
          ({
            canCreate: false,
            canRead: false,
            canUpdate: false,
            canDelete: false,
            scope: "ALL" as const,
            permissionType: "CRUD" as const,
          } as TablePermission);

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
  const groupedPermissions = useMemo(() => {
    const groups = {
      CRUD: [] as typeof localPermissions,
      PROCESS: [] as typeof localPermissions,
      READ_ONLY: [] as typeof localPermissions,
    };

    // Filtrar y agrupar según búsqueda
    const filtered = localPermissions.filter((row) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        row.label.toLowerCase().includes(q) ||
        row.tableName.toLowerCase().includes(q)
      );
    });

    // Agrupar por tipo
    filtered.forEach((row) => {
      groups[row.permissionType].push(row);
    });

    // Ordenar cada grupo alfabéticamente por label
    Object.keys(groups).forEach((key) => {
      groups[key as keyof typeof groups].sort((a, b) =>
        a.label.localeCompare(b.label),
      );
    });

    return groups;
  }, [localPermissions, searchQuery]);

  const GROUP_ORDER: PermissionType[] = ["CRUD", "PROCESS", "READ_ONLY"];
  const GROUP_LABELS: Record<PermissionType, string> = {
    CRUD: "Acceso Completo",
    PROCESS: "Procesos",
    READ_ONLY: "Solo Lectura",
  };
  const GROUP_COLORS: Record<PermissionType, string> = {
    CRUD: "bg-success/20 text-success",
    PROCESS: "bg-warning/20 text-warning",
    READ_ONLY: "bg-info/20 text-info",
  };

  const totalResults = Object.values(groupedPermissions).reduce(
    (sum, group) => sum + group.length,
    0,
  );

  return (
    <>
      <Separator className="opacity-50" />

      {/* ── Permissions board ── */}
      <CardContent className="p-0 bg-background">
        {tables.length === 0 ? (
          <EmptyState hasUser />
        ) : (
          <div className="flex flex-col">
            {/* Search + column headers */}
            <div className="sticky top-0 z-10 flex flex-col gap-2 md:gap-4 border-b bg-background/95 backdrop-blur-md px-3 py-3 md:px-6 md:py-4 lg:flex-row lg:items-center">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Filtrar por nombre o recurso..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 md:h-10 border-border/60 bg-muted/20 pl-10 text-sm shadow-none transition-all focus:bg-background focus:ring-primary/20 rounded-xl"
                />
              </div>
              {!canEdit ? (
                <Badge
                  variant="outline"
                  className="h-8 md:h-9 px-3 md:px-4 rounded-xl border-dashed border-muted-foreground/30 bg-muted/30 text-muted-foreground font-bold text-[9px] md:text-[10px] uppercase tracking-widest gap-2"
                >
                  <Shield className="h-3 md:h-3.5 w-3 md:h-3.5" />
                  Modo lectura
                </Badge>
              ) : null}
            </div>

            {/* Rows */}
            <ScrollArea className="flex flex-col bg-muted/5">
              <div className="flex flex-col gap-4 md:gap-6 p-3 md:p-6">
                {totalResults === 0 ? (
                  // ✅ Empty state mejorado
                  <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Search className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-xs md:text-sm font-bold text-foreground">
                      No hay coincidencias
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                      No encontramos ningún recurso.
                    </p>
                    {searchQuery.trim() && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 md:mt-4 h-8 text-[10px]"
                        onClick={() => setSearchQuery("")}
                      >
                        <RotateCcw className="h-3 w-3 mr-1.5" />
                        Limpiar
                      </Button>
                    )}
                  </div>
                ) : (
                  // ✅ Renderizado agrupado
                  GROUP_ORDER.map((type) => {
                    const rows = groupedPermissions[type];
                    if (rows.length === 0) return null;

                    return (
                      <div key={type} className="space-y-2 md:space-y-3">
                        {/* Header del grupo */}
                        <div className="flex items-center gap-2 md:gap-3 px-1 py-1 md:py-2">
                          <div
                            className={cn(
                              "h-4 md:h-6 w-1 md:w-1.5 rounded-full",
                              type === "CRUD" && "bg-success",
                              type === "PROCESS" && "bg-warning",
                              type === "READ_ONLY" && "bg-info",
                            )}
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-base md:text-lg font-bold text-foreground">
                              {GROUP_LABELS[type]}
                            </span>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 rounded-md",
                                GROUP_COLORS[type],
                              )}
                            >
                              {rows.length}
                            </Badge>
                          </div>
                        </div>

                        {/* Divider sutil */}
                        <div className="h-px bg-border/30 mx-1" />

                        {/* Filas del grupo */}
                        <div className="space-y-2 md:space-y-3">
                          {rows.map((row) => {
                            const originalRow = userPermissions[
                              row.tableName
                            ] || {
                              canCreate: false,
                              canRead: false,
                              canUpdate: false,
                              canDelete: false,
                              scope: "ALL" as const,
                              permissionType: row.permissionType,
                            };
                            return (
                              <PermissionRowItem
                                key={row.tableName}
                                row={row}
                                originalRow={{
                                  tableName: row.tableName,
                                  label: row.label,
                                  ...originalRow,
                                }}
                                onToggleCrud={handleToggleCrud}
                                onScopeChange={handleScopeChange}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>

      {/* ── Footer ── */}
      {tables.length > 0 && canEdit ? (
        <>
          <Separator className="opacity-50" />
          <CardFooter className="flex flex-col gap-3 md:gap-4 items-center justify-between px-4 py-4 md:px-6 md:py-6 bg-muted/5 sm:flex-row">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-1.5 md:h-2 w-1.5 md:w-2 rounded-full",
                  isDirty
                    ? "bg-primary animate-pulse"
                    : "bg-muted-foreground/20",
                )}
              />
              <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {isDirty
                  ? `${changedCount} ${changedCount === 1 ? "pendiente" : "pendientes"}`
                  : "Actualizado"}
              </p>
            </div>
            <div className="flex items-center gap-1 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscard}
                disabled={!isDirty || !canEdit}
                className="flex-1 md:h-11 h-9 gap-1.5 md:gap-2 rounded-xl border-border/60 hover:bg-background sm:flex-none font-bold text-[10px] md:text-xs uppercase tracking-widest"
              >
                <RotateCcw className="h-3.5 md:h-4 w-3.5 md:w-4" />
                Descartar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!isDirty || isSaving || !canEdit}
                className="flex-1 md:h-11 h-9 gap-1.5 md:gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 sm:flex-none font-bold text-[10px] md:text-xs uppercase tracking-widest"
              >
                {isSaving ? (
                  <div className="h-3.5 md:h-4 w-3.5 md:w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <Save className="h-3.5 md:h-4 w-3.5 md:w-4" />
                )}
                Guardar
              </Button>
            </div>
          </CardFooter>
        </>
      ) : null}
    </>
  );
}
