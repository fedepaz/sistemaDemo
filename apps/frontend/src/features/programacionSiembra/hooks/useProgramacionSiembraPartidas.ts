// apps/frontend/src/features/programacionSiembra/hooks/useProgramacionSiembraPartidas.ts
"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { ProgramacionSiembraDto } from "@vivero/shared";
import { programacionSiembraService } from "../api/programacionSiembraService";
import { programacionSiembraQueryKeys } from "@/lib/queryKeys";

/**
 * Hook to manage extendidos data.
 * Always fetches records "in chamber" and applies local filtering by camaraId.
 */

export function useProgramacionSiembraPartidas() {
  return useSuspenseQuery<ProgramacionSiembraDto[]>({
    queryKey: programacionSiembraQueryKeys.partidas(),
    queryFn: programacionSiembraService.fetchAll,
  });
}
