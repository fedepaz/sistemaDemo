import { clientFetch } from "@/lib/api/client-fetch";
import {
  SiembraPartidaDto,
  AsignarUbiSiembraCompletaDto,
} from "@vivero/shared";

export const aSembrarService = {
  fetchPending: () =>
    clientFetch<SiembraPartidaDto[]>("siembra-partidas/pending", {
      method: "GET",
    }),

  completarSiembra: (id: string, data: AsignarUbiSiembraCompletaDto) =>
    clientFetch<void>(`l-partidas/asignar-siembra/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};