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
