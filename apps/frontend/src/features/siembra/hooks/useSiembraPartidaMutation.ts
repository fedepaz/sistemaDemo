// apps/frontend/src/features/siembra/hooks/useSiembraPartidaMutation.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AsignarUbiSiembraCompletaDto } from "@vivero/shared";
import { toast } from "sonner";

import { invalidateQueries } from "@/lib/query-invalidation-map";
import { siembraService } from "../api/siembraService";

export const useSiembraMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, AsignarUbiSiembraCompletaDto>({
    mutationFn: siembraService.asignarUbicacionSiembra,
    onSuccess: () => {
      invalidateQueries(queryClient, "siembraPartida");
      toast.success("Ubicación asignada exitosamente", { duration: 3000 });
    },
  });
};
