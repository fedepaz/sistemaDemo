// src/features/permissions/components/permissions-entity-manager.tsx

import { useEntityPermissions } from "../hooks/permsHooks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Search, Shield, User } from "lucide-react";
import { useState, useMemo } from "react";
import { CRUD_COLUMNS, SCOPE_LABELS } from "../constants/table-meta";
import { cn } from "@/lib/utils";
import { usePermission } from "@/hooks/usePermission";

interface PermissionsEntityManagerProps {
  entityId: string;
}

export function PermissionsEntityManager({
  entityId,
}: PermissionsEntityManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: userPermissions = [] } = useEntityPermissions(entityId);

  const dataTablePermissions = usePermission("user_permissions");
  const canEdit = dataTablePermissions.canUpdate;

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return userPermissions;
    const q = searchQuery.toLowerCase();
    return userPermissions.filter(
      (up) =>
        up.username.toLowerCase().includes(q) ||
        up.firstName?.toLowerCase().includes(q) ||
        up.lastName?.toLowerCase().includes(q),
    );
  }, [userPermissions, searchQuery]);

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    return [firstName?.[0], lastName?.[0]].filter(Boolean).join("").toUpperCase() || "U";
  };

  return (
    <>
      <Separator className="opacity-50" />
      <CardContent className="p-0 bg-background">
        <div className="flex flex-col">
          {/* Header con búsqueda */}
          <div className="sticky top-0 z-10 flex flex-col gap-4 border-b bg-background/95 backdrop-blur-md px-6 py-4 lg:flex-row lg:items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                placeholder="Buscar usuarios con acceso..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 border-border/60 bg-muted/20 pl-10 text-sm shadow-none transition-all focus:bg-background focus:ring-primary/20 rounded-xl"
              />
            </div>
            <Badge
              variant="outline"
              className="h-9 px-4 rounded-xl border-dashed border-muted-foreground/30 bg-muted/30 text-muted-foreground font-bold text-[10px] uppercase tracking-widest gap-2"
            >
              <Shield className="h-3.5 w-3.5" />
              {userPermissions.length} usuarios con acceso
            </Badge>
          </div>

          <ScrollArea className="flex flex-col bg-muted/5">
            <div className="flex flex-col gap-3 p-6">
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <User className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    No hay usuarios encontrados
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {searchQuery.trim() 
                      ? "Ningún usuario coincide con tu búsqueda."
                      : "Esta tabla no tiene permisos asignados específicamente."}
                  </p>
                </div>
              ) : (
                filteredUsers.map((up) => (
                  <div
                    key={up.userId}
                    className="group relative flex flex-col gap-6 rounded-xl border border-border/50 bg-background p-5 transition-all hover:bg-muted/30 lg:flex-row lg:items-center lg:gap-8"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-4 lg:w-64 lg:shrink-0">
                      <Avatar className="h-11 w-11 border border-border/50 shadow-sm">
                        <AvatarFallback className="bg-primary/5 text-xs font-bold text-primary">
                          {getInitials(up.firstName, up.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-bold text-foreground truncate">
                          {up.firstName && up.lastName 
                            ? `${up.firstName} ${up.lastName}` 
                            : up.username}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
                          @{up.username}
                        </span>
                      </div>
                    </div>

                    {/* Permissions Grid */}
                    <div className="flex flex-1 items-center justify-around gap-2 px-4">
                      {CRUD_COLUMNS.map((col) => {
                        const hasPerm = (up.permissions as TablePermission)[col.key];
                        return (
                          <div key={col.key} className="flex flex-col items-center gap-2">
                             <col.icon
                                className={cn(
                                  "h-4 w-4",
                                  hasPerm ? col.color : "text-muted-foreground/20",
                                )}
                              />
                              <span
                                className={cn(
                                  "text-[10px] font-bold uppercase tracking-widest",
                                  hasPerm ? "text-foreground" : "text-muted-foreground/30",
                                )}
                              >
                                {col.label}
                              </span>
                              <div
                                className={cn(
                                  "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                                  hasPerm
                                    ? "border-primary/20 bg-primary/5 text-primary"
                                    : "border-muted-foreground/10 bg-muted/30 text-muted-foreground/20",
                                )}
                              >
                                {hasPerm ? (
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                ) : (
                                  <div className="h-0.5 w-1.5 rounded-full bg-current" />
                                )}
                              </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Scope Badge */}
                    <div className="flex flex-col gap-2 lg:w-40 lg:shrink-0 lg:items-end">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 lg:mr-1">
                        Alcance
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-8 rounded-lg px-4 text-[11px] font-bold uppercase tracking-widest border-2",
                          up.permissions.scope === "ALL" && "border-primary/20 bg-primary/5 text-primary",
                          up.permissions.scope === "OWN" && "border-primary/20 bg-primary/5 text-primary",
                          up.permissions.scope === "NONE" && "border-muted-foreground/10 bg-muted/20 text-muted-foreground/60",
                        )}
                      >
                        {SCOPE_LABELS[up.permissions.scope].label}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </>
  );
}
