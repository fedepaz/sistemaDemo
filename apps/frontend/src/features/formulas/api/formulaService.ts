// apps/frontend/src/features/formulas/api/formulaService.ts
import { clientFetch } from "@/lib/api/client-fetch";
import { CreateFormulaDto, FormulaDto } from "@vivero/shared";

export const formulaService = {
  fetchAll: () => {
    return clientFetch<FormulaDto[]>("formula", { method: "GET" });
  },

  create: (data: CreateFormulaDto) => {
    return clientFetch<FormulaDto>("formula", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
