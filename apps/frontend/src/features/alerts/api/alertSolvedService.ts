// src/features/alerts/api/alertSolvedService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { AlertSolvedDto, CreateAlertSolvedDto } from "@vivero/shared";

export const alertSolvedService = {
  fetchAll: () => {
    return clientFetch<AlertSolvedDto[]>("alert-solved", { method: "GET" });
  },

  create: (data: CreateAlertSolvedDto) => {
    return clientFetch<AlertSolvedDto>(`alert-solved`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
