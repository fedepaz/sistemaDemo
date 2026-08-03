// src/features/alerts/hooks/useAlertCommentsMutation.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCommentDto, CreateAlertCommentDto } from "@vivero/shared";
import { alertCommentsService } from "../api/alertCommentsService";
import { invalidateQueries } from "@/lib/query-invalidation-map";
import { toast } from "sonner";

export const useAlertCommentsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<AlertCommentDto, Error, CreateAlertCommentDto>({
    mutationFn: alertCommentsService.createComment,
    onSuccess: () => {
      invalidateQueries(queryClient, "createAlertComment");
      toast.success("Comentario agregado", { duration: 3000 });
    },
  });
};
