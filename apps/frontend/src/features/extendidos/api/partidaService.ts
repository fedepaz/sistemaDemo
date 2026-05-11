// src/features/extendidos/api/partidaService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { AsignarUbicacionDto } from "@vivero/shared";

export const partidaService = {
  async fetchAll() {
    return clientFetch("l-partidas", { method: "GET" });
  },

  asignarUbicacion(data: AsignarUbicacionDto) {
    return clientFetch<void>("l-partidas/asignar-ubicacion", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
