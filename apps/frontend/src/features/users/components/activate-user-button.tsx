// src/features/users/components/activate-user-button.tsx
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
import { UserCheck, Loader2 } from "lucide-react";

import { useActivateUser } from "../hooks/usersHooks";

type Props = {
  selectedUser: UserProfileDto;
  onSuccess: () => void;
};

export function ActivateUserButton({ selectedUser, onSuccess }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { mutateAsync: activateUser, isPending: isActivating } =
    useActivateUser();

  const handleConfirm = async () => {
    if (!selectedUser) return;
    try {
      await activateUser({ userId: selectedUser.id });
      onSuccess();
    } catch {}
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="w-full cursor-pointer border-success/30 bg-success/10 text-success hover:bg-success/15 hover:text-success"
            onClick={() => setDialogOpen(true)}
            disabled={isActivating}
            aria-label="Activar usuario"
          >
            {isActivating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserCheck className="mr-2 h-4 w-4" />
            )}
            Activar usuario
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="border border-border shadow-md">
          <p>Activa el usuario</p>
        </TooltipContent>
      </Tooltip>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <UserCheck className="h-6 w-6 text-success" />
              </div>
              <AlertDialogTitle className="text-xl">
                Activar usuario
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base pt-2">
              ¿Deseas activar el usuario?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isActivating}
              className="min-h-[48px] min-w-[100px]"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isActivating}
              className="min-h-[48px] min-w-[100px] bg-success text-success-foreground hover:bg-success/90"
            >
              {isActivating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Activar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
