// src/features/dashboard/hooks/useConfig.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { useSuspenseQuery } from "@tanstack/react-query";

interface Config {
  codigo: string;
  nombre: string;
}

export const CONFIG_QUERY_KEY = {
  all: () => ["l-config"] as const,
};
export const useConfig = () => {
  return useSuspenseQuery<Config[]>({
    queryKey: CONFIG_QUERY_KEY.all(),
    queryFn: () =>
      clientFetch<Config[]>("l-config", {
        method: "GET",
      }),
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useCompanyData = () => {
  const { data: config = [] } = useConfig();

  const companyData = Object.fromEntries(
    config.map((c) => [c.codigo, c.nombre]),
  );

  const name = companyData["Nombre"] || "Demo";
  const initials =
    companyData["Siglas"] ||
    name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return {
    ...companyData,
    name,
    initials,
    fullData: companyData,
  };
};
