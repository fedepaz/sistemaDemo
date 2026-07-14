// src/features/alerts/hooks/useAlertActions.ts
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { alertsQueryKeys } from "@/lib/queryKeys";
import type {
  SiembraRetrasadaDto,
  FaltaGerminacionDto,
  FaltantePlantasDto,
  FaltaPreExpedicionDto,
} from "@vivero/shared";

type SiembraAction = "sembrada" | "anulada";

export function useAlertActions() {
  const queryClient = useQueryClient();

  const dismissSiembra = (partidaId: number, indice: number, action: SiembraAction) => {
    queryClient.setQueryData<SiembraRetrasadaDto[]>(
      alertsQueryKeys.byType("siembra-retrasada"),
      (old) => old?.filter((a) => !(a.partidaId === partidaId && a.indice === indice)) ?? []
    );
    toast.success(
      action === "sembrada"
        ? "Partida marcada como sembrada"
        : "Partida anulada",
      { duration: 3000 }
    );
  };

  const dismissGerminacion = (partidaId: number, indice: number) => {
    queryClient.setQueryData<FaltaGerminacionDto[]>(
      alertsQueryKeys.byType("falta-germinacion"),
      (old) => old?.filter((a) => !(a.partidaId === partidaId && a.indice === indice)) ?? []
    );
    toast.success("Recuento de germinación registrado", { duration: 3000 });
  };

  const dismissFaltante = (partidaId: number, indice: number) => {
    queryClient.setQueryData<FaltantePlantasDto[]>(
      alertsQueryKeys.byType("faltante-plantas"),
      (old) => old?.filter((a) => !(a.partidaId === partidaId && a.indice === indice)) ?? []
    );
    toast.success("Faltante intervenido y resuelto", { duration: 3000 });
  };

  const dismissPreExpedicion = (partidaId: number, indice: number) => {
    queryClient.setQueryData<FaltaPreExpedicionDto[]>(
      alertsQueryKeys.byType("falta-pre-expedicion"),
      (old) => old?.filter((a) => !(a.partidaId === partidaId && a.indice === indice)) ?? []
    );
    toast.success("Pre-expedición cargada exitosamente", { duration: 3000 });
  };

  return {
    dismissSiembra,
    dismissGerminacion,
    dismissFaltante,
    dismissPreExpedicion,
  };
}
