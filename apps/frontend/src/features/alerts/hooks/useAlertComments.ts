// src/features/alerts/hooks/useAlertComments.ts
"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { AlertCommentDto } from "@vivero/shared";
import { alertCommentsService } from "../api/alertCommentsService";
import { alertCommentsQueryKeys } from "@/lib/queryKeys";

export const useAlertComments = (
  alertType: string,
  partidaId: number,
  anio: number,
  indice: number,
) => {
  return useSuspenseQuery<AlertCommentDto[]>({
    queryKey: alertCommentsQueryKeys.byPartida(
      alertType,
      partidaId,
      anio,
      indice,
    ),
    queryFn: () =>
      alertCommentsService.fetchComments(alertType, partidaId, anio, indice),
    retry: 1,
  });
};
