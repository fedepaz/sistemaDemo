/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/extendidos/hooks/usePartidas.ts

import { clientFetch } from "@/lib/api/client-fetch";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

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
  return useSuspenseQuery<any[]>({
    queryKey: partidasQueryKeys.all(),
    queryFn: () => clientFetch<any[]>("l-partidas", { method: "GET" }),
    retry: 1, // Retry once to account for transient network issues
  });
};

export const usePartidaByPartida = (partida: number) => {
  return useSuspenseQuery<any | null>({
    queryKey: partidasQueryKeys.byPartida(partida),
    queryFn: () => {
      return clientFetch<any | null>(`l-partidas/${partida}`, {
        method: "GET",
      });
    },

    retry: 1, // Retry once to account for transient network issues
  });
};

export const usePartidasByFecha = (fecha: string) => {
  return useSuspenseQuery<any[]>({
    queryKey: partidasQueryKeys.byFecha(fecha),
    queryFn: () => {
      return clientFetch<any[]>(`l-partidas/fecha/${fecha}`, {
        method: "GET",
      });
    },
    retry: 1, // Retry once to account for transient network issues
  });
};

export const usePartidasByFechaRange = (
  fechaInicio: string,
  fechaFin: string,
) => {
  return useSuspenseQuery<any[]>({
    queryKey: partidasQueryKeys.byFechaRange(fechaInicio, fechaFin),
    queryFn: () => {
      return clientFetch<any[]>(`l-partidas/fecha/${fechaInicio}/${fechaFin}`, {
        method: "GET",
      });
    },
    retry: 1, // Retry once to account for transient network issues
  });
};

export const usePartidasByAno = (ano: number) => {
  return useSuspenseQuery<any[]>({
    queryKey: partidasQueryKeys.byAno(ano),
    queryFn: () => {
      return clientFetch<any[]>(`l-partidas/ano/${ano}`, {
        method: "GET",
      });
    },
    retry: 1, // Retry once to account for transient network issues
  });
};

export const usePartidasByCamara = (camara: number) => {
  return useSuspenseQuery<any[]>({
    queryKey: partidasQueryKeys.byCamara(camara),
    queryFn: () => {
      return clientFetch<any[]>(`l-partidas/camara/${camara}`, {
        method: "GET",
      });
    },
    retry: 1, // Retry once to account for transient network issues
  });
};
