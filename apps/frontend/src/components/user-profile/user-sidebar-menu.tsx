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
} from "@/components/ui/tooltip";
import { useAuthContext } from "@/features/auth/providers/AuthProvider";

export function UserSidebarMenu() {
  const { logoutAsync } = useLogout();
  const [openProfile, setOpenProfile] = useState(false);
  const { userProfile } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logoutAsync();
    } catch {}
  };
  return (
    <>
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
    </>
  );
}
