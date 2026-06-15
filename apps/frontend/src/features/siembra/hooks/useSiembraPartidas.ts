// apps/frontend/src/features/siembra/hooks/useSiembraPartidas.ts
"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { SiembraDto } from "@vivero/shared";
import { siembraService } from "../api/siembraService";

/**
 * Hook to manage extendidos data.
 * Always fetches records "in chamber" and applies local filtering by camaraId.
 */
export const siembraPartidasQueryKey = ["siembra", "partidas"] as const;

export function useSiembraPartidas() {
  return useSuspenseQuery<SiembraDto[]>({
    queryKey: siembraPartidasQueryKey,
    queryFn: siembraService.fetchAll,
  });
}
