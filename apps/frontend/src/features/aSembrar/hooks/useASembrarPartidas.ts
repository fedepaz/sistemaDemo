"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { SiembraPartidaDto } from "@vivero/shared";
import { aSembrarService } from "../api/aSembrarService";
import { aSembrarQueryKeys } from "@/lib/queryKeys";

export function useASembrarPartidas() {
  return useSuspenseQuery<SiembraPartidaDto[]>({
    queryKey: aSembrarQueryKeys.all(),
    queryFn: aSembrarService.fetchPending,
  });
}