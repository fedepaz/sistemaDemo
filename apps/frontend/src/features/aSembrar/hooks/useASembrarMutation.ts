"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AsignarUbiSiembraCompletaDto } from "@vivero/shared";
import { toast } from "sonner";
import { invalidateQueries } from "@/lib/query-invalidation-map";
import { aSembrarService } from "../api/aSembrarService";

export const useASembrarMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { id: string; data: AsignarUbiSiembraCompletaDto }
  >({
    mutationFn: ({ id, data }) => aSembrarService.completarSiembra(id, data),
    onSuccess: () => {
      invalidateQueries(queryClient, "aSembrar");
      invalidateQueries(queryClient, "siembraPartida");
      toast.success("Siembra completada exitosamente", { duration: 3000 });
    },
  });
};