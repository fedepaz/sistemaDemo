// src/features/extendidos/hooks/useExtendidos.ts

import { useSuspenseQuery } from "@tanstack/react-query";
import { ExtendidoDto } from "@vivero/shared";
import { extendidoService } from "../api/extendidoService";

export const extendidosQueryKeys = {
  all: () => ["extendidos"] as const,
  byFecha: (fecha: string) =>
    [...extendidosQueryKeys.all(), "byFecha", fecha] as const,
};

export const useExtendidosByFecha = (fecha: string) => {
  return useSuspenseQuery<ExtendidoDto[]>({
    queryKey: extendidosQueryKeys.byFecha(fecha),
    queryFn: () => extendidoService.fetchByFecha(fecha),
    retry: 1,
  });
};
