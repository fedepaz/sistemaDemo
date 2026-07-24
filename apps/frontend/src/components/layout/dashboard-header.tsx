// src/components/layout/dashboard-header.tsx
"use client";

import { MobileNavigation } from "./mobile-navigation";

import { useLogout } from "@/features/auth";
import { LoadingSpinner } from "../common/loading-spinner";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/features/auth/providers/AuthProvider";
import { useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Logo } from "../common/logo";
import { getISOWeek, getTotalWeeks, formatSpanishDate } from "@/lib/date-utils";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAlertModal } from "@/providers/alert-modal-provider";
import { AlertModalDialog } from "@/components/modals/alert-modal-dialog";
import { usePermission } from "@/hooks/usePermission";
import { useHasAlerts } from "@/features/alerts";

export function DashboardHeader() {
  const { openAlert } = useAlertModal();
  const { isLoading } = useLogout();
  const router = useRouter();
  const { userProfile } = useAuthContext();
  const { canRead } = usePermission("alerts");
  const { hasAlerts, isLoading: isLoadingAlerts } = useHasAlerts(canRead);

  const currentDate = new Date();
  const weekNum = getISOWeek(currentDate);
  const totalWeeks = getTotalWeeks(currentDate.getFullYear());
  const formattedDate = formatSpanishDate(currentDate);

  useEffect(() => {
    if (!userProfile) {
      router.push("/");
    }
  }, [userProfile, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openAlert("info")}
                disabled={!hasAlerts && !isLoadingAlerts}
                aria-label="Alertas"
                className="h-14 w-10 rounded-none"
              >
                <Bell className={`h-5 w-5 ${!hasAlerts && !isLoadingAlerts ? "text-muted-foreground/50" : "text-muted-foreground"}`} />
              </Button>
            )}

            {/* Week Display with Tooltip */}
            <TooltipProvider>
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
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">
                      {formattedDate}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Semana {weekNum} de {totalWeeks}
                    </p>
                    <div className="pt-1 border-t border-border/50">
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        Mendoza, Argentina
                      </p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      {canRead && <AlertModalDialog />}
    </header>
  );
}
