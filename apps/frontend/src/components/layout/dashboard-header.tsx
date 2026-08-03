// src/components/layout/dashboard-header.tsx
"use client";

import { MobileNavigation } from "./mobile-navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Logo } from "../common/logo";
import { getISOWeek, getTotalWeeks, formatSpanishDate } from "@/lib/date-utils";
import { Bell, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAlertModal } from "@/providers/alert-modal-provider";
import { AlertModalDialog } from "@/components/modals/alert-modal-dialog";
import { usePermission } from "@/hooks/usePermission";
import { useHasAlerts } from "@/features/alerts";
import { cn } from "@/lib/utils";

function WeekInfoContent({
  formattedDate,
  weekNum,
  totalWeeks,
}: {
  formattedDate: string;
  weekNum: number;
  totalWeeks: number;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-bold text-foreground">{formattedDate}</p>
      <p className="text-[10px] text-muted-foreground leading-tight">
        Semana {weekNum} de {totalWeeks}
      </p>
      <div className="pt-1 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground leading-tight">
          Mendoza, Argentina
        </p>
      </div>
    </div>
  );
}

export function DashboardHeader() {
  const { openAlert } = useAlertModal();
  const { canRead } = usePermission("alerts");
  const { hasAlerts, isLoading: isLoadingAlerts } = useHasAlerts(canRead);

  const currentDate = new Date();
  const weekNum = getISOWeek(currentDate);
  const totalWeeks = getTotalWeeks(currentDate.getFullYear());
  const formattedDate = formatSpanishDate(currentDate);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
      <div className="container mx-auto px-1">
        <div className="flex h-14 items-center justify-between">
          {/* Logo and Mobile Navigation */}
          <div className="flex items-center space-x-3">
            <MobileNavigation />
            <div className="flex items-center space-x-2 md:hidden">
              <Logo variant="icon" className="h-4 w-auto" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            {/* Notifications */}
            {canRead && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openAlert("info")}
                    disabled={!hasAlerts && !isLoadingAlerts}
                    aria-label="Alertas"
                  >
                    <Bell
                      className={cn(
                        "h-5 w-5 transition-colors",
                        hasAlerts
                          ? "text-primary hover"
                          : "text-muted-foreground/50",
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-popover border-border shadow-xl w-56"
                >
                  {hasAlerts ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <p className="text-xs font-bold text-foreground">
                          Alertas Activas
                        </p>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Hay partidas que requieren tu atención. Haz click para
                        ver el detalle completo.
                      </p>
                      <div className="pt-1 border-t border-border/50">
                        <p className="text-[10px] font-medium text-warning">
                          Ver alertas →
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground/50" />
                        <p className="text-xs font-bold text-muted-foreground">
                          Sin Alertas
                        </p>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Todas las partidas están dentro de los parámetros
                        esperados.
                      </p>
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Week Display with Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center px-3 border-r border-border/50 h-14 cursor-help">
                  <div className="flex flex-col items-end">
                    <p className="text-xl font-black text-foreground tracking-tighter leading-none">
                      S{weekNum}
                    </p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">
                      Semana
                    </p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-popover border-border shadow-xl"
              >
                <WeekInfoContent
                  formattedDate={formattedDate}
                  weekNum={weekNum}
                  totalWeeks={totalWeeks}
                />
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      {canRead && <AlertModalDialog />}
    </header>
  );
}
