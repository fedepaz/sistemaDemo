"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { billboardService } from "../api/billboardService";
import { billboardQueryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

export const useMarkBillboardRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: billboardService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: billboardQueryKeys.unread(),
      });
      toast.success("¡Actualizaciones revisadas!");
    },
  });
};
