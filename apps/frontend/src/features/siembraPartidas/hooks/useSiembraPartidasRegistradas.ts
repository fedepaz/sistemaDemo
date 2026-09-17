"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { SiembraPartidaDto } from "@vivero/shared";
import { siembraPartidasRegistradasService } from "../api/siembraPartidasRegistradasService";
import { programacionSiembraPartidasRegistradasQueryKeys } from "@/lib/queryKeys";

export function useSiembraPartidasRegistradas() {
  return useSuspenseQuery<SiembraPartidaDto[]>({
    queryKey: programacionSiembraPartidasRegistradasQueryKeys.all(),
    queryFn: siembraPartidasRegistradasService.fetchAll,
  });
}
