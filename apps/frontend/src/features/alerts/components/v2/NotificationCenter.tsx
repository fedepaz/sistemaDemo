// src/features/alerts/components/v2/NotificationCenter.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bell } from "lucide-react";

interface NotificacionAuditoria {
  id: string;
  destino: string;
  fecha: string;
  mensaje: string;
  partidaId?: number;
}

interface NotificationCenterProps {
  notifications: NotificacionAuditoria[];
  onClearAll: () => void;
  onClearItem: (id: string) => void;
}

export function NotificationCenter({
  notifications,
  onClearAll,
  onClearItem,
}: NotificationCenterProps) {
  const hasNotifications = notifications.length > 0;

  return (
    <Card className="border-border/40 shadow-sm h-fit">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {hasNotifications && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
              )}
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Notificaciones
            </p>
          </div>
          {hasNotifications && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearAll}
              className="text-[10px] h-6 px-2"
              aria-label="Limpiar todas las notificaciones"
            >
              Limpiar todo
            </Button>
          )}
        </div>

        <div className="max-h-64 overflow-auto space-y-1">
          {!hasNotifications ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Sin notificaciones
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-start justify-between gap-2 text-xs bg-muted/30 rounded px-2 py-1.5 group"
              >
                <div className="space-y-0.5 min-w-0">
                  <p className="font-semibold text-foreground truncate">{n.mensaje}</p>
                  <p className="text-muted-foreground">
                    {n.destino} — {n.fecha}
                  </p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onClearItem(n.id)}
                        className="h-5 w-5 px-0 opacity-0 group-hover:opacity-100 shrink-0"
                        aria-label="Eliminar notificación"
                      >
                        ×
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Eliminar notificación</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))
          )}
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Los correos electrónicos se almacenan aquí para cumplimiento operativo
        </p>
      </CardContent>
    </Card>
  );
}
