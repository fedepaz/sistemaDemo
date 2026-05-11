// src/components/layout/dashboard-header.tsx
"use client";

import { MobileNavigation } from "./mobile-navigation";

import { useLogout } from "@/features/auth/hooks/useLogout";
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

export function DashboardHeader() {
  const { isLoading } = useLogout();
  const router = useRouter();
  const { userProfile } = useAuthContext();

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-1 ">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Mobile Navigation */}
          <div className="flex items-center space-x-4">
            <MobileNavigation />
            <div className="flex items-center space-x-2 md:hidden">
              <Logo variant="icon" className="h-5 w-auto" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle 
            <ThemeToggle />
            */}

            {/* Notifications */}
            {/* Left: Week Display with Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center px-4 border-r border-border/50 h-16 cursor-help">
                    <div className="flex flex-col items-end">
                      <p className="text-2xl font-black text-foreground tracking-tighter leading-none">
                        S{weekNum}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
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
    </header>
  );
}
