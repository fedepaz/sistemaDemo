// apps/frontend/src/features/siembra/hooks/useSiembraPartidaMutation.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AsignarUbicacionDto } from "@vivero/shared";
import { toast } from "sonner";
import { siembraQueryKeys } from "@/lib/queryKeys";
import { invalidateQueries } from "@/lib/query-invalidation-map";

/**
 * Hook for administrative partida ubicacion assignment.
 * TODO: Implement actual API call when backend endpoint is ready.
 */
export const useSiembraPartidaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AsignarUbicacionDto) => {
      // TODO: Replace with actual API call when endpoint is ready
      // return clientFetch("siembra/asignar-ubicacion", {
      //   method: "POST",
      //   body: JSON.stringify(data),
      // });
      console.log("SiembraPartidaMutation - pending backend implementation:", data);
      throw new Error("Backend endpoint not yet implemented");
    },
    onSuccess: () => {
      toast.success("Ubicación asignada correctamente");
      invalidateQueries(queryClient, "siembraPartida");
      queryClient.invalidateQueries({ queryKey: siembraQueryKeys.all() });
    },
    onError: (error: Error) => {
      if (error.message !== "Backend endpoint not yet implemented") {
        toast.error("Error al asignar ubicación");
      }
    },
  });
};
