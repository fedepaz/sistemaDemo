// src/features/extendidos/api/partidaService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { AsignarUbiExtendidoDto } from "@vivero/shared";

export const partidaService = {
  async fetchAll() {
    return clientFetch("l-partidas", { method: "GET" });
  },

  asignarUbicacionExtendido(data: AsignarUbiExtendidoDto) {
    return clientFetch<void>("l-partidas/asignar-extendido", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
