// apps/frontend/src/features/programacionSiembra/hooks/useProgramacionSiembraPartidaMutation.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { invalidateQueries } from "@/lib/query-invalidation-map";
import { programacionSiembraService } from "../api/programacionSiembraService";

export const useProgramacionSiembraAutorizacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: programacionSiembraService.autorizarSiembra,
    onSuccess: () => {
      invalidateQueries(queryClient, "siembraPartida");
      toast.success("Partida autorizada para siembra", { duration: 3000 });
    },
  });
};
