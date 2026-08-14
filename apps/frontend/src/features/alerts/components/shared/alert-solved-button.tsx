// src/features/alerts/components/shared/alert-solved-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useAlertSolvedMutation } from "@/features/alerts/hooks/useAlertSolvedMutation";
import { AlertBaseDto } from "@vivero/shared";

type Props = {
  selectedAlert: AlertBaseDto;
  onSuccess: () => void;
};

export function AlertSolvedButton({ selectedAlert, onSuccess }: Props) {
  const { mutate: createSolvedAlert, isPending: isCreatingSolvedAlert } =
    useAlertSolvedMutation();
  const handleAlertsSolved = async () => {
    if (!selectedAlert) return;
    try {
      createSolvedAlert({
        partidaId: selectedAlert.partidaId,
        anio: selectedAlert.anio,
        indice: selectedAlert.indice,
      });
      onSuccess();
    } catch {}
  };
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleAlertsSolved}
      disabled={isCreatingSolvedAlert}
    >
      {isCreatingSolvedAlert ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Check className="mr-2 h-4 w-4" />
      )}
      Marcar alerta como resuelta
    </Button>
  );
}
