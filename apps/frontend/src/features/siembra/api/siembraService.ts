// src/features/siembra/api/siembraService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import {
  AsignarUbiSiembraCompletaDto,
  AutorizarSiembraDto,
  SiembraDto,
  SiembraPartidaDto,
  TratamientoDto,
} from "@vivero/shared";

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

  autorizarSiembra: (data: AutorizarSiembraDto) => {
    return clientFetch<SiembraPartidaDto>("l-partidas/autorizar-siembra", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  fetchTratamientos: () => {
    return clientFetch<TratamientoDto[]>("l-tratamiento", { method: "GET" });
  },
};
