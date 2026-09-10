// apps/frontend/src/features/siembra/hooks/useSiembraPartidaMutation.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { invalidateQueries } from "@/lib/query-invalidation-map";
import { siembraService } from "../api/siembraService";

export const useSiembraAutorizacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: siembraService.autorizarSiembra,
    onSuccess: () => {
      invalidateQueries(queryClient, "siembraPartida");
      toast.success("Partida autorizada para siembra", { duration: 3000 });
    },
  });
};
