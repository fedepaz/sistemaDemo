// src/features/programacionSiembra/hooks/useTratamientos.ts
"use client";

import { programacionSiembraQueryKeys } from "@/lib/queryKeys";
import { useSuspenseQuery } from "@tanstack/react-query";
import { TratamientoDto } from "@vivero/shared";
import { programacionSiembraService } from "../api/programacionSiembraService";

export const useTratamientos = () => {
  return useSuspenseQuery<TratamientoDto[]>({
    queryKey: programacionSiembraQueryKeys.tratamientos(),
    queryFn: () => programacionSiembraService.fetchTratamientos(),
  });
};
