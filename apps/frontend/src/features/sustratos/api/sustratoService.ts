// apps/frontend/src/features/sustratos/api/sustratoService.ts
import { clientFetch } from "@/lib/api/client-fetch";
import { CreateSustratoDto, SustratoDto } from "@vivero/shared";

export const sustratoService = {
  fetchAll: () => {
    return clientFetch<SustratoDto[]>("sustratos", { method: "GET" });
  },

  create: (data: CreateSustratoDto) => {
    return clientFetch<SustratoDto>("sustratos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
