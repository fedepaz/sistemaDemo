// src/features/siembra/api/siembraService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { ExtendidoDto } from "@vivero/shared";

export const siembraService = {
  fetchAll: () => {
    return clientFetch<ExtendidoDto[]>("l-siembra", { method: "GET" });
  },
};
