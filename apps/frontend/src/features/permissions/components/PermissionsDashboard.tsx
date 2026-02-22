// src/features/permissions/components/permissions-manager.tsx
"use client";

import { Shield } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EmptyState } from "./empty-state";

import { PermissionsManager } from "./permissions-manager";
import { useState } from "react";
import { UserSelector } from "./user-selector";

export function PermissionsDashboard() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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
        <UserSelector onSelectedUserId={setSelectedUserId} />
        {!selectedUserId ? (
          <div className="border-t border-dashed bg-muted/5">
            <EmptyState hasUser={false} />
          </div>
        ) : (
          <PermissionsManager key={selectedUserId} userId={selectedUserId} />
        )}
      </Card>
    </TooltipProvider>
  );
}
