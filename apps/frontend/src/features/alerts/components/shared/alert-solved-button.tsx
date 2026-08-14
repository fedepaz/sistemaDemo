// src/features/alerts/components/shared/alert-solved-button.tsx
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
import { Check, Loader2 } from "lucide-react";
import { useAlertSolvedMutation } from "@/features/alerts/hooks/useAlertSolvedMutation";
import { AlertBaseDto } from "@vivero/shared";

type Props = {
  selectedAlert: AlertBaseDto;
  onSuccess: () => void;
};

export function AlertSolvedButton({ selectedAlert, onSuccess }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { mutate: createSolvedAlert, isPending: isCreatingSolvedAlert } =
    useAlertSolvedMutation();

  const handleConfirm = () => {
    if (!selectedAlert) return;
    createSolvedAlert({
      partidaId: selectedAlert.partidaId,
      anio: selectedAlert.anio,
      indice: selectedAlert.indice,
    });
    onSuccess();
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="w-full cursor-pointer"
            onClick={() => setDialogOpen(true)}
            disabled={isCreatingSolvedAlert}
            aria-label="Marcar alerta como resuelta"
          >
            {isCreatingSolvedAlert ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Marcar alerta como resuelta
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="border border-border shadow-md">
          <p>Oculta esta alerta de la lista</p>
        </TooltipContent>
      </Tooltip>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <AlertDialogTitle className="text-xl">
                Marcar como resuelta
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base pt-2">
              Esta alerta se ocultará de la lista. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isCreatingSolvedAlert}
              className="min-h-[48px] min-w-[100px]"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isCreatingSolvedAlert}
              className="min-h-[48px] min-w-[100px]"
            >
              {isCreatingSolvedAlert ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Marcar como resuelta"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
