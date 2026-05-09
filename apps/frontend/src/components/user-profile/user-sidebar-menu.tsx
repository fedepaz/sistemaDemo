// src/components/user-profile/user-sidebar-menu.tsx
"use client";

import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserMenu } from "../user-profile/user-menu";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useState } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useAuthContext } from "@/features/auth/providers/AuthProvider";
import { cn } from "@/lib/utils";

interface UserSidebarMenuProps {
  isCollapsed?: boolean;
}

export function UserSidebarMenu({ isCollapsed = false }: UserSidebarMenuProps) {
  const { logoutAsync } = useLogout();
  const [openProfile, setOpenProfile] = useState(false);
  const { userProfile } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logoutAsync();
    } catch {}
  };

  const initials = `${userProfile?.firstName?.charAt(0) || ""}${userProfile?.lastName?.charAt(0) || ""}`;

  return (
    <>
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "relative flex items-center gap-3 transition-all duration-300 agricultural-touch-target hover:bg-muted/50",
                    isCollapsed ? "h-10 w-10 p-0 justify-center rounded-full mx-auto" : "w-full justify-start p-2 rounded-xl",
                  )}
                  aria-label="Perfil de usuario"
                >
                  <div className={cn(
                    "shrink-0 bg-primary rounded-full flex items-center justify-center transition-all",
                    isCollapsed ? "h-8 w-8" : "h-9 w-9 shadow-sm"
                  )}>
                    <span className={cn(
                      "text-primary-foreground font-black tracking-tighter",
                      isCollapsed ? "text-[10px]" : "text-xs"
                    )}>
                      {initials || <User className="h-4 w-4" />}
                    </span>
                  </div>
                  
                  {!isCollapsed && (
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <p className="text-sm font-black text-foreground truncate leading-tight tracking-tight w-full text-left">
                        {userProfile?.firstName} {userProfile?.lastName}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground truncate leading-tight tracking-wider uppercase opacity-70 w-full text-left">
                        {userProfile?.username}
                      </p>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent
                side="right"
                className="border border-border shadow-xl bg-popover"
              >
                <div className="flex flex-col gap-0.5">
                  <p className="font-black text-xs text-primary">{userProfile?.firstName} {userProfile?.lastName}</p>
                  <p className="text-[10px] text-muted-foreground font-bold">{userProfile?.username}</p>
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        
        <DropdownMenuContent align={isCollapsed ? "start" : "end"} side={isCollapsed ? "right" : "top"} className="w-56 p-1.5 border-border/50 shadow-2xl rounded-xl">
          <DropdownMenuLabel className="px-2 py-1.5 flex flex-col gap-0.5">
            <span className="text-xs font-black text-primary uppercase tracking-widest">Cuenta</span>
            <span className="text-sm font-bold truncate">{userProfile?.firstName} {userProfile?.lastName}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1 opacity-50" />
          <DropdownMenuItem 
            onClick={() => setOpenProfile(true)}
            className="cursor-pointer rounded-lg focus:bg-primary/5 focus:text-primary transition-colors py-2"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary/20" />
              <span className="font-bold">Ver Perfil</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1 opacity-50" />
          <DropdownMenuItem 
            className="cursor-pointer rounded-lg focus:bg-destructive/5 focus:text-destructive transition-colors py-2"
          >
            <button className="w-full text-left font-bold" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UserMenu open={openProfile} onOpenChange={setOpenProfile} />
    </>
  );
}
