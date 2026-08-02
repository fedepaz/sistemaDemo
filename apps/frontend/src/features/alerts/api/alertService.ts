// src/features/alerts/api/alertService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import {
  SiembraRetrasadaDto,
  FaltaGerminacionDto,
  FaltantePlantasDto,
  FaltaPreExpedicionDto,
} from "@vivero/shared";

export const alertService = {
  fetchSiembraRetrasada: () => {
    return clientFetch<SiembraRetrasadaDto[]>("l-alerts/siembra-retrasada", {
      method: "GET",
    });
  },

  fetchFaltaGerminacion: () => {
    return clientFetch<FaltaGerminacionDto[]>("l-alerts/falta-germinacion", {
      method: "GET",
    });
  },

  fetchFaltantePlantas: () => {
    return clientFetch<FaltantePlantasDto[]>("l-alerts/faltante-plantas", {
      method: "GET",
    });
  },

  fetchFaltaPreExpedicion: () => {
    return clientFetch<FaltaPreExpedicionDto[]>("l-alerts/falta-pre-expedicion", {
      method: "GET",
    });
  },
};
