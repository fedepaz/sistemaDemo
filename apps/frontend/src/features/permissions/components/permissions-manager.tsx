//src/features/permissions/components/permissions-manager.tsx

import { PermissionScope, TablePermission } from "@vivero/shared";
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
import { Search, RotateCcw, Save } from "lucide-react";
import { EmptyState } from "./empty-state";
import { PermissionRowItem } from "./permission-row-item";
import { getTableMeta } from "../constants/table-meta";

interface PermissionsManagerProps {
  userId: string;
}

export function PermissionsManager({ userId }: PermissionsManagerProps) {
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
        const current =
          prev[tableName] ||
          userPermissions[tableName] ||
          ({
            canCreate: false,
            canRead: false,
            canUpdate: false,
            canDelete: false,
            scope: "NONE" as const,
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
            scope: "NONE" as const,
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
      {tables.length > 0 ? (
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
      ) : null}
    </>
  );
}
