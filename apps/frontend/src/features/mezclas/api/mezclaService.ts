// apps/frontend/src/features/mezclas/api/mezclaService.ts
import { clientFetch } from "@/lib/api/client-fetch";
import { CreateMezclaDto, MezclaDto } from "@vivero/shared";

export const mezclaService = {
  fetchAll: () => {
    return clientFetch<MezclaDto[]>("mezcla", { method: "GET" });
  },

  create: (data: CreateMezclaDto) => {
    return clientFetch<MezclaDto>("mezcla", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
