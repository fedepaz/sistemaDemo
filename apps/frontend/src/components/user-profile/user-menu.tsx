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
      <DialogContent className="max-w-2xl p-0">
        <div className="flex w-full">
          {/* Sidebar */}
          <nav className="w-40 bg-background border-r border-border p-4 space-y-2">
            <button
              onClick={() => setTab("info")}
              className="w-full text-left px-2 py-2 text-sm font-medium rounded hover:bg-muted"
            >
              Información de Perfil
            </button>

            <button
              onClick={() => setTab("edit")}
              className="w-full text-left px-2 py-2 text-sm font-medium rounded hover:bg-muted"
            >
              Editar Perfil
            </button>
          </nav>

          {/* Content */}
          <div className="flex-1 p-6 overflow-auto">
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
