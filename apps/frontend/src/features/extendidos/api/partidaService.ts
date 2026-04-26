// src/features/extendidos/api/partidaService.ts

import { clientFetch } from "@/lib/api/client-fetch";

export const partidaService = {
  async fetchAll() {
    return clientFetch("l-partidas", { method: "GET" });
  },

  async fetchByPartida(partida: number) {
    return clientFetch(`l-partidas/${partida}`, {
      method: "GET",
    });
  },

  async fetchByFecha(fecha: string) {
    return clientFetch(`l-partidas/fecha/${fecha}`, {
      method: "GET",
    });
  },

  async fetchByFechaRange(fechaInicio: string, fechaFin: string) {
    return clientFetch(`l-partidas/fecha/${fechaInicio}/${fechaFin}`, {
      method: "GET",
    });
  },

  async fetchByAno(ano: number) {
    return clientFetch(`l-partidas/ano/${ano}`, {
      method: "GET",
    });
  },

  async fetchByCamara(camara: number) {
    return clientFetch(`l-partidas/camara/${camara}`, {
      method: "GET",
    });
  },
};
