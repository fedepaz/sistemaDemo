// src/features/extendidos/hooks/useExtendidos.ts

import { useSuspenseQuery } from "@tanstack/react-query";
import { ExtendidoDto } from "@vivero/shared";
import { extendidoService } from "../api/extendidoService";
import { extendidosQueryKeys } from "@/lib/queryKeys";

export const useAllExtendidos = () => {
  return useSuspenseQuery<ExtendidoDto[]>({
    queryKey: extendidosQueryKeys.all(),
    queryFn: () => extendidoService.fetchAllExtendidos(),
    retry: 1,
  });
};

export const useAvailableExtendidoDates = () => {
  return useSuspenseQuery<string[]>({
    queryKey: extendidosQueryKeys.fechas(),
    queryFn: () => extendidoService.fetchAvailableExtendidoDates(),
    retry: 1,
  });
};

export const useExtendidosByFecha = (fecha: string) => {
  return useSuspenseQuery<ExtendidoDto[]>({
    queryKey: extendidosQueryKeys.byFecha(fecha),
    queryFn: () => extendidoService.fetchByFecha(fecha),
    retry: 1,
  });
};
