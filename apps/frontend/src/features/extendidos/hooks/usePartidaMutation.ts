// apps/frontend/src/features/extendidos/hooks/usePartidaMutation.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AsignarUbicacionDto } from "@vivero/shared";
import { toast } from "sonner";
import { partidaService } from "../api/partidaService";
import { invalidateQueries } from "@/lib/query-invalidation-map";

/**
 * Hook for administrative partida ubicacion assignment.
 * Unlike public partida ubicacion assignment, this does NOT automatically sign in the newly created user.
 */
export const usePartidaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, AsignarUbicacionDto>({
    mutationFn: partidaService.asignarUbicacion,
    onSuccess: () => {
      invalidateQueries(queryClient, "partidaUbicacion");
      toast.success("Ubicación asignada exitosamente", {
        duration: 3000,
      });
    },
  });
};
