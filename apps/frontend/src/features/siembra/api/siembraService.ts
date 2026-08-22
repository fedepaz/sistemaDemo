// src/features/siembra/api/siembraService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { AsignarUbiSiembraDto, SiembraDto } from "@vivero/shared";

export const siembraService = {
  fetchAll: () => {
    return clientFetch<SiembraDto[]>("l-siembra", { method: "GET" });
  },

  asignarUbicacionSiembra: (data: AsignarUbiSiembraDto) => {
    return clientFetch<void>("l-partidas/asignar-siembra", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
