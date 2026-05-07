// src/components/layout/dashboard-header.tsx
"use client";

import { Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileNavigation } from "./mobile-navigation";

import { useLogout } from "@/features/auth/hooks/useLogout";
import { LoadingSpinner } from "../common/loading-spinner";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/features/auth/providers/AuthProvider";
import { useEffect, useState } from "react";
import { UserMenu } from "../user-profile/user-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Logo } from "../common/logo";
import { getISOWeek, getTotalWeeks, formatSpanishDate } from "@/lib/date-utils";

export function DashboardHeader() {
  const { isLoading, logoutAsync } = useLogout();
  const router = useRouter();
  const { userProfile } = useAuthContext();
  const [openProfile, setOpenProfile] = useState(false);

  const currentDate = new Date();
  const weekNum = getISOWeek(currentDate);
  const totalWeeks = getTotalWeeks(currentDate.getFullYear());
  const formattedDate = formatSpanishDate(currentDate);

  useEffect(() => {
    if (!userProfile) {
      router.push("/");
    }
  }, [userProfile, router]);

  const handleLogout = async () => {
    try {
      await logoutAsync();
    } catch {}
  };

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
            {/* Left: Date header */}
            <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 border-r border-border/50 h-16">
              <div className="hidden sm:flex h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-primary/10 items-center justify-center shadow-inner shrink-0">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider sm:tracking-widest truncate leading-tight">
                  <span className="hidden sm:inline">Mendoza • </span>Semana {weekNum}/{totalWeeks}
                </p>
                <p className="hidden sm:block text-[11px] sm:text-xs font-bold text-foreground capitalize truncate leading-tight">
                  {formattedDate}
                </p>
              </div>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="agricultural-touch-target"
                      aria-label="Perfil de usuario"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="border border-border shadow-md"
                >
                  <p>Perfil de usuario</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {userProfile?.firstName} {userProfile?.lastName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setOpenProfile(true)}>
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <button className="w-full" onClick={handleLogout}>
                    Cerrar sesión
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <UserMenu open={openProfile} onOpenChange={setOpenProfile} />
          </div>
        </div>
      </div>
    </header>
  );
}
