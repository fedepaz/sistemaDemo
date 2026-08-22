// src/features/alerts/hooks/useAlertSolvedMutation.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertSolvedDto, CreateAlertSolvedDto } from "@vivero/shared";
import { alertSolvedService } from "../api/alertSolvedService";
import { invalidateQueries } from "@/lib/query-invalidation-map";
import { toast } from "sonner";

export const useAlertSolvedMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<AlertSolvedDto, Error, CreateAlertSolvedDto>({
    mutationFn: alertSolvedService.create,
    onSuccess: () => {
      invalidateQueries(queryClient, "createAlertSolved");
      toast.success("Alerta resuelta", { duration: 3000 });
    },
  });
};
