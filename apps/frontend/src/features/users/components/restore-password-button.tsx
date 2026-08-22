// src/features/users/components/restore-password-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserProfileDto } from "@vivero/shared";
import { KeyRound, Loader2 } from "lucide-react";
import { useRestorePassword } from "../hooks/usersHooks";

type Props = {
  selectedUser: UserProfileDto;
  onSuccess: () => void;
};

export function RestorePasswordButton({ selectedUser, onSuccess }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { mutateAsync: restorePassword, isPending: isRestoring } =
    useRestorePassword();

  const handleConfirm = async () => {
    if (!selectedUser) return;
    try {
      await restorePassword({ userId: selectedUser.id });
      onSuccess();
    } catch {}
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="w-full cursor-pointer border-info/30 bg-info/10 text-info hover:bg-info/15 hover:text-info"
            onClick={() => setDialogOpen(true)}
            disabled={isRestoring}
            aria-label="Restaurar contraseña del usuario"
          >
            {isRestoring ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="mr-2 h-4 w-4" />
            )}
            Restaurar contraseña
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="border border-border shadow-md">
          <p>Genera una contraseña por defecto para el usuario</p>
        </TooltipContent>
      </Tooltip>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-info/10">
                <KeyRound className="h-6 w-6 text-info" />
              </div>
              <AlertDialogTitle className="text-xl">
                Restaurar contraseña
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base pt-2">
              Se generará una contraseña por defecto para el usuario. ¿Deseas
              continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isRestoring}
              className="min-h-[48px] min-w-[100px]"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isRestoring}
              className="min-h-[48px] min-w-[100px] bg-info text-info-foreground hover:bg-info/90"
            >
              {isRestoring ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Restaurar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
