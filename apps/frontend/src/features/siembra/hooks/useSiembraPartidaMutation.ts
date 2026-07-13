// apps/frontend/src/features/siembra/hooks/useSiembraPartidaMutation.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AsignarUbiSiembraDto } from "@vivero/shared";
import { toast } from "sonner";
import { siembraQueryKeys } from "@/lib/queryKeys";
import { invalidateQueries } from "@/lib/query-invalidation-map";
import { siembraService } from "../api/siembraService";

export const useSiembraPartidaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, AsignarUbiSiembraDto>({
    mutationFn: siembraService.asignarUbicacionSiembra,
    onSuccess: () => {
      invalidateQueries(queryClient, "siembraPartida");
      queryClient.invalidateQueries({ queryKey: siembraQueryKeys.all() });
      toast.success("Ubicación asignada exitosamente", { duration: 3000 });
    },
    onError: (error) => {
      if (error.message !== "Backend endpoint not yet implemented") {
        toast.error("Error al asignar ubicación");
      }
    },
  });
};
