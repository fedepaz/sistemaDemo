// src/features/programacionSiembra/api/programacionSiembraService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import {
  AsignarUbiSiembraCompletaDto,
  AutorizarSiembraDto,
  LegacySustratoDto,
  ProgramacionSiembraDto,
  SiembraPartidaDto,
  TratamientoDto,
} from "@vivero/shared";

export const programacionSiembraService = {
  fetchAll: () => {
    return clientFetch<ProgramacionSiembraDto[]>("l-programacion-siembra", {
      method: "GET",
    });
  },

  asignarUbicacionSiembra: (data: AsignarUbiSiembraCompletaDto) => {
    return clientFetch<void>("l-partidas/asignar-siembra", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  autorizarSiembra: (data: AutorizarSiembraDto) => {
    return clientFetch<SiembraPartidaDto>("l-partidas/autorizar-siembra", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  fetchTratamientos: () => {
    return clientFetch<TratamientoDto[]>("l-tratamiento", { method: "GET" });
  },

  fetchLegacySustratos: () => {
    return clientFetch<LegacySustratoDto[]>("l-sustrato", { method: "GET" });
  },
};
