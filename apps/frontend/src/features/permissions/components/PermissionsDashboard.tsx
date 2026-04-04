// src/features/permissions/components/PermissionsDashboard.tsx
"use client";

import { Shield, User, Database } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import { EmptyState } from "./empty-state";

import { PermissionsUserManager } from "./permissions-user-manager";
import { Suspense, useState } from "react";
import { UserSelector } from "./user-selector";
import { UserSelectorSkeleton } from "./user-selector-skeleton";
import { PermissionsManagerSkeleton } from "./permission-manager-skeleton";
import { PermissionSelectorSkeleton } from "./permission-selector-skeleton";
import { PermissionSelector } from "./permission-selector";
import { PermissionsEntityManager } from "./permissions-entity-manager";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type ViewMode = "user" | "entity";

export function PermissionsDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>("user");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  return (
    <Card className="w-full overflow-hidden border-border/60 shadow-md transition-all hover:shadow-lg">
      {/* ── Header ── */}
      <CardHeader className="pb-6 bg-muted/10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shadow-sm border border-primary/20">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">
                Gestionar permisos
              </CardTitle>
              <CardDescription className="text-sm">
                Configura los niveles de acceso por recurso para cada usuario de
                la plataforma
              </CardDescription>
            </div>
          </div>

          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(val) => val && setViewMode(val as ViewMode)}
            className="bg-muted/50 p-1 rounded-xl border border-border/60 self-start sm:self-center"
          >
            <ToggleGroupItem
              value="user"
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest gap-2 transition-all",
                viewMode === "user" && "bg-background shadow-sm text-primary"
              )}
            >
              <User className="h-3.5 w-3.5" />
              Por Usuario
            </ToggleGroupItem>
            <ToggleGroupItem
              value="entity"
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest gap-2 transition-all",
                viewMode === "entity" && "bg-background shadow-sm text-primary"
              )}
            >
              <Database className="h-3.5 w-3.5" />
              Por Recurso
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>

      <Separator className="opacity-50" />

      {/* Selectores dinámicos según el modo */}
      {viewMode === "user" ? (
        <Suspense fallback={<UserSelectorSkeleton />}>
          <UserSelector onSelectedUserId={setSelectedUserId} />
        </Suspense>
      ) : (
        <Suspense fallback={<PermissionSelectorSkeleton />}>
          <PermissionSelector onSelectedEntityId={setSelectedTableId} />
        </Suspense>
      )}

      {/* Contenido principal */}
      <div className="relative">
        {viewMode === "user" ? (
          !selectedUserId ? (
            <div className="border-t border-dashed bg-muted/5">
              <EmptyState hasUser={false} />
            </div>
          ) : (
            <Suspense fallback={<PermissionsManagerSkeleton />}>
              <PermissionsUserManager
                key={selectedUserId}
                userId={selectedUserId}
              />
            </Suspense>
          )
        ) : (
          !selectedTableId ? (
            <div className="border-t border-dashed bg-muted/5">
              <EmptyState hasUser={false} />
            </div>
          ) : (
            <Suspense fallback={<PermissionsManagerSkeleton />}>
              <PermissionsEntityManager
                key={selectedTableId}
                entityId={selectedTableId}
              />
            </Suspense>
          )
        )}
      </div>
    </Card>
  );
}
