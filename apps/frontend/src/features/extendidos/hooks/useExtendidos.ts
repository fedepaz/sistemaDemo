// src/features/extendidos/hooks/useExtendidos.ts

import { useSuspenseQuery } from "@tanstack/react-query";
import { ExtendidoDto } from "@vivero/shared";
import { extendidoService } from "../api/extendidoService";

export const extendidosQueryKeys = {
  all: () => ["extendidos"] as const,
  fechas: () => ["extendidos", "fechas"] as const,
  byFecha: (fecha: string) =>
    [...extendidosQueryKeys.all(), "byFecha", fecha] as const,
};

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

export const useExtendidosEnCamaraByFecha = (fecha: string) => {
  return useSuspenseQuery<ExtendidoDto[]>({
    queryKey: extendidosQueryKeys.byFecha(fecha),
    queryFn: () => extendidoService.fetchExtendidosEnCamara(fecha),
    retry: 1,
  });
};
