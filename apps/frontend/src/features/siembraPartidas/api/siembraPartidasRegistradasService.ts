import { clientFetch } from "@/lib/api/client-fetch";
import { SiembraPartidaDto } from "@vivero/shared";

export const siembraPartidasRegistradasService = {
  fetchAll: () =>
    clientFetch<SiembraPartidaDto[]>("siembra-partidas", { method: "GET" }),
};
