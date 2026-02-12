// src/components/layout/user-menu.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { User } from "lucide-react";
import { UserProfileInfo } from "./user-info";
import { UserProfileEdit } from "./user-edit";

interface UserMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserMenu({ open, onOpenChange }: UserMenuProps) {
  const [tab, setTab] = useState<"info" | "edit">("info");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-xl md:max-w-2xl">
        <div className="flex flex-col md:flex-row w-full">
          {/* Sidebar */}
          <nav className="flex-shrink-0 w-full md:w-40 bg-background border-b md:border-b-0 md:border-r border-border p-2 md:p-4 space-x-2 md:space-x-0 space-y-0 md:space-y-2 overflow-x-auto">
            <button
              onClick={() => setTab("info")}
              className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                ${tab === "info"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              `}
            >
              Información de Perfil
            </button>

            <button
              onClick={() => setTab("edit")}
              className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                ${tab === "edit"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              `}
            >
              Editar Perfil
            </button>
          </nav>

          {/* Content */}
          <div className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="flex gap-2 items-center mb-4">
              <div className="bg-gradient-to-r from-primary to-primary/80 px-3 py-2 shrink-0">
                <div className="h-6 w-6 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
              </div>
              <DialogTitle className="text-lg font-semibold">
                {tab === "info" ? "Perfil de Usuario" : "Editar Perfil"}
              </DialogTitle>
            </div>

            {tab === "info" ? <UserProfileInfo /> : <UserProfileEdit />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
