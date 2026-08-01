"use client";

import { MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlertComments } from "@/features/alerts/hooks/useAlertComments";
import { cn } from "@/lib/utils";
import type { AlertBaseDto } from "@vivero/shared";
import type { AlertType } from "@/features/alerts/types";
import { ALERT_TYPE_CONFIGS } from "./alert-type-config";

interface AlertsViewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: AlertBaseDto | null;
  alertType: AlertType;
}

function SpecGridCell({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | null;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="bg-muted/50 p-2 rounded-lg border border-border/40">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide truncate">
          {label}
        </span>
      </div>
      <p className="text-sm font-semibold truncate">{String(value)}</p>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin}m`;
  if (diffH < 24) return `hace ${diffH}h`;
  return `hace ${diffD}d`;
}

export function AlertsViewForm({
  open,
  onOpenChange,
  alert,
  alertType,
}: AlertsViewFormProps) {
  const config = ALERT_TYPE_CONFIGS[alertType];
  const { data: comments, isPending: commentsLoading } = useAlertComments(
    alertType,
    alert?.partidaId ?? 0,
    alert?.anio ?? 0,
    alert?.indice ?? 0,
  );

  if (!alert) return null;

  const keyMetricValue = config.keyMetric
    ? (alert as Record<string, unknown>)[config.keyMetric.field]
    : null;

  const TypeIcon = config.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl flex flex-col h-dvh p-0 overflow-hidden"
        side="right"
      >
        {/* Type-specific header */}
        <div className={cn("px-6 py-4", config.bgColor)}>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", config.bgColor)}>
              <TypeIcon className={cn("h-5 w-5", config.color)} />
            </div>
            <div>
              <SheetTitle className={cn("text-base font-semibold", config.color)}>
                {config.label}
              </SheetTitle>
              <p className="text-xs text-muted-foreground">
                Partida #{alert.partidaId}/{alert.indice} · Año {alert.anio}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Key Metric Card */}
          {config.keyMetric && keyMetricValue !== null && keyMetricValue !== undefined && (
            <div className="bg-card/40 p-4 rounded-xl border border-border/40 shadow-premium">
              <div className="flex items-center gap-2 mb-1">
                <config.keyMetric.icon className={cn("h-4 w-4", config.color)} />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {config.keyMetric.label}
                </span>
              </div>
              <p className={cn("text-2xl font-bold", config.color)}>
                {String(keyMetricValue)}
              </p>
            </div>
          )}

          {/* Spec Grid */}
          {config.fields.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {config.fields.map((field) => {
                const value = (alert as Record<string, unknown>)[field.field];
                return (
                  <SpecGridCell
                    key={field.field}
                    icon={field.icon}
                    label={field.label}
                    value={value as string | number | null}
                  />
                );
              })}
            </div>
          )}

          {/* Separator + Comments */}
          <Separator className="my-4" />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Comentarios {comments ? `(${comments.length})` : ""}
              </span>
            </div>

            {commentsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs bg-muted">
                      {getInitials(comment.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium truncate">
                        {comment.userName}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay comentarios aún
              </p>
            )}
          </div>
        </div>

        <SheetFooter className="px-6 py-4 border-t">
          <SheetClose asChild>
            <Button variant="outline">Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
