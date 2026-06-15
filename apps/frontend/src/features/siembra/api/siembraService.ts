// src/features/siembra/api/siembraService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { SiembraDto } from "@vivero/shared";

export const siembraService = {
  fetchAll: () => {
    return clientFetch<SiembraDto[]>("l-siembra", { method: "GET" });
  },
};
