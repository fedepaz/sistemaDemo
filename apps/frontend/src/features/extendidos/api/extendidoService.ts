// src/features/extendidos/api/extendidoService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { ExtendidoDto } from "@vivero/shared";

export const extendidoService = {
  async fetchByFecha(fecha: string): Promise<ExtendidoDto[]> {
    return clientFetch<ExtendidoDto[]>(`l-extendidos/${fecha}`, {
      method: "GET",
    });
  },
};
