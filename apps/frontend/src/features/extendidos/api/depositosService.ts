// src/features/extendidos/api/camarasService.ts

import { clientFetch } from "@/lib/api/client-fetch";

export interface DepositoDto {
  codigo: number;
  nombre: string;
  camara: string;
  bandejas: number;
}

export const depositosService = {
  async fetchAll(): Promise<DepositoDto[]> {
    return clientFetch<DepositoDto[]>("l-depositos", { method: "GET" });
  },

  async fetchCamaras(): Promise<DepositoDto[]> {
    return clientFetch<DepositoDto[]>("l-depositos/camaras", { method: "GET" });
  },

  async fetchByCodigo(codigo: number): Promise<DepositoDto | null> {
    return clientFetch<DepositoDto | null>(`l-depositos/${codigo}`, {
      method: "GET",
    });
  },
};
