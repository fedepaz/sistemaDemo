"use client";

import { useQuery } from "@tanstack/react-query";
import { LegacySustratoDto } from "@vivero/shared";
import { siembraService } from "../api/siembraService";
import { siembraQueryKeys } from "@/lib/queryKeys";

export const useLegacySustratos = (enabled: boolean) => {
  return useQuery<LegacySustratoDto[]>({
    queryKey: siembraQueryKeys.legacySustratos(),
    queryFn: () => siembraService.fetchLegacySustratos(),
    enabled,
  });
};
