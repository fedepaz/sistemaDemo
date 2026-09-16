"use client";

import { useQuery } from "@tanstack/react-query";
import { LegacySustratoDto } from "@vivero/shared";
import { programacionSiembraService } from "../api/programacionSiembraService";
import { programacionSiembraQueryKeys } from "@/lib/queryKeys";

export const useLegacySustratos = (enabled: boolean) => {
  return useQuery<LegacySustratoDto[]>({
    queryKey: programacionSiembraQueryKeys.legacySustratos(),
    queryFn: () => programacionSiembraService.fetchLegacySustratos(),
    enabled,
  });
};
