// src/features/alerts/api/alertCommentsService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import type { AlertCommentDto, CreateAlertCommentDto } from "@vivero/shared";

const ALERT_TYPE_SLUG_MAP: Record<string, string> = {
  "siembra-retrasada": "SIEMBRA_RETRASADA",
  "falta-germinacion": "FALTA_GERMINACION",
  "faltante-plantas": "FALTANTE_PLANTAS",
  "falta-pre-expedicion": "FALTA_PRE_EXPEDICION",
};

function toAlertTypeEnum(slug: string): string {
  return ALERT_TYPE_SLUG_MAP[slug] ?? slug;
}

export const alertCommentsService = {
  fetchComments(
    alertType: string,
    partidaId: number,
    anio: number,
    indice: number,
  ) {
    return clientFetch<AlertCommentDto[]>(
      `alert-comments/${alertType}/${partidaId}/${anio}/${indice}`,
      { method: "GET" },
    );
  },

  createComment(dto: CreateAlertCommentDto) {
    return clientFetch<AlertCommentDto>("alert-comments", {
      method: "POST",
      body: JSON.stringify({
        ...dto,
        alertType: toAlertTypeEnum(dto.alertType),
      }),
    });
  },
};
