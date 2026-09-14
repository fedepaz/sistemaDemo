"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { SiembraPartidaDto } from "@vivero/shared";
import { siembraPartidasRegistradasService } from "../api/siembraPartidasRegistradasService";
import { siembraPartidasRegistradasQueryKeys } from "@/lib/queryKeys";

export function useSiembraPartidasRegistradas() {
  return useSuspenseQuery<SiembraPartidaDto[]>({
    queryKey: siembraPartidasRegistradasQueryKeys.all(),
    queryFn: siembraPartidasRegistradasService.fetchAll,
  });
}
