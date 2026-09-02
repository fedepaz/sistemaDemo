// src/features/siembra/hooks/useTratamientos.ts
"use client";

import { siembraQueryKeys } from "@/lib/queryKeys";
import { useSuspenseQuery } from "@tanstack/react-query";
import { TratamientoDto } from "@vivero/shared";
import { siembraService } from "../api/siembraService";

export const useTratamientos = () => {
  return useSuspenseQuery<TratamientoDto[]>({
    queryKey: siembraQueryKeys.tratamientos(),
    queryFn: () => siembraService.fetchTratamientos(),
  });
};
