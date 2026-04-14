// src/features/extendidos/hooks/usePartidas.ts

import { useSuspenseQuery } from "@tanstack/react-query";
import { partidaService } from "../api/partidaService";
import { PartidaDto } from "@vivero/shared";

export const partidasQueryKeys = {
  all: () => ["partidas"] as const,
  byPartida: (partida: number) =>
    [...partidasQueryKeys.all(), "byPartida", partida] as const,
  byFecha: (fecha: string) =>
    [...partidasQueryKeys.all(), "byFecha", fecha] as const,
  byFechaRange: (fechaInicio: string, fechaFin: string) =>
    [
      ...partidasQueryKeys.all(),
      "byFechaRange",
      fechaInicio,
      fechaFin,
    ] as const,
  byAno: (ano: number) => [...partidasQueryKeys.all(), "byAno", ano] as const,
  byCamara: (camara: number) =>
    [...partidasQueryKeys.all(), "byCamara", camara] as const,
};

export const usePartidas = () => {
  return useSuspenseQuery<PartidaDto[]>({
    queryKey: partidasQueryKeys.all(),
    queryFn: () => partidaService.fetchAll(),
    retry: 1,
  });
};

export const usePartidaByPartida = (partida: number) => {
  return useSuspenseQuery<PartidaDto | null>({
    queryKey: partidasQueryKeys.byPartida(partida),
    queryFn: () => partidaService.fetchByPartida(partida),
    retry: 1,
  });
};

export const usePartidasByFecha = (fecha: string) => {
  return useSuspenseQuery<PartidaDto[]>({
    queryKey: partidasQueryKeys.byFecha(fecha),
    queryFn: () => partidaService.fetchByFecha(fecha),
    retry: 1,
  });
};

export const usePartidasByFechaRange = (
  fechaInicio: string,
  fechaFin: string,
) => {
  return useSuspenseQuery<PartidaDto[]>({
    queryKey: partidasQueryKeys.byFechaRange(fechaInicio, fechaFin),
    queryFn: () => partidaService.fetchByFechaRange(fechaInicio, fechaFin),
    retry: 1,
  });
};

export const usePartidasByAno = (ano: number) => {
  return useSuspenseQuery<PartidaDto[]>({
    queryKey: partidasQueryKeys.byAno(ano),
    queryFn: () => partidaService.fetchByAno(ano),
    retry: 1,
  });
};

export const usePartidasByCamara = (camara: number) => {
  return useSuspenseQuery<PartidaDto[]>({
    queryKey: partidasQueryKeys.byCamara(camara),
    queryFn: () => partidaService.fetchByCamara(camara),
    retry: 1,
  });
};
