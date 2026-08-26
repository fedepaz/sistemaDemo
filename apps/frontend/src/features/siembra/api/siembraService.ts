// src/features/siembra/api/siembraService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { AsignarUbiSiembraCompletaDto, SiembraDto } from "@vivero/shared";

export const siembraService = {
  fetchAll: () => {
    return clientFetch<SiembraDto[]>("l-siembra", { method: "GET" });
  },

  asignarUbicacionSiembra: (data: AsignarUbiSiembraCompletaDto) => {
    return clientFetch<void>("l-partidas/asignar-siembra", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
