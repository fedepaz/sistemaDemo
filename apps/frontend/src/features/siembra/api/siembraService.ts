// src/features/siembra/api/siembraService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { AsignarUbicacionDto } from "@vivero/shared";

export const siembraService = {
  async fetchAll() {
    return clientFetch("l-partidas", { method: "GET" });
  },

  asignarUbicacion(data: AsignarUbicacionDto) {
    return console.log(data);
  },
};
