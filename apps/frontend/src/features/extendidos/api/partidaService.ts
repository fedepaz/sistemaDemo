// src/features/extendidos/api/partidaService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { PartidaDto } from "@vivero/shared";

export const partidaService = {
  async fetchAll(): Promise<PartidaDto[]> {
    return clientFetch<PartidaDto[]>("l-partidas", { method: "GET" });
  },

  async fetchByPartida(partida: number): Promise<PartidaDto | null> {
    return clientFetch<PartidaDto | null>(`l-partidas/${partida}`, {
      method: "GET",
    });
  },

  async fetchByFecha(fecha: string): Promise<PartidaDto[]> {
    return clientFetch<PartidaDto[]>(`l-partidas/fecha/${fecha}`, {
      method: "GET",
    });
  },

  async fetchByFechaRange(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<PartidaDto[]> {
    return clientFetch<PartidaDto[]>(
      `l-partidas/fecha/${fechaInicio}/${fechaFin}`,
      {
        method: "GET",
      },
    );
  },

  async fetchByAno(ano: number): Promise<PartidaDto[]> {
    return clientFetch<PartidaDto[]>(`l-partidas/ano/${ano}`, {
      method: "GET",
    });
  },

  async fetchByCamara(camara: number): Promise<PartidaDto[]> {
    return clientFetch<PartidaDto[]>(`l-partidas/camara/${camara}`, {
      method: "GET",
    });
  },
};
