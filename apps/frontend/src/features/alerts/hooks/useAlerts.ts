// src/features/alerts/hooks/useAlerts.ts
"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import {
  SiembraRetrasadaDto,
  FaltaGerminacionDto,
  FaltantePlantasDto,
  FaltaPreExpedicionDto,
} from "@vivero/shared";
import { alertService } from "../api/alertService";
import { alertsQueryKeys } from "@/lib/queryKeys";

export const useSiembraRetrasada = () => {
  return useSuspenseQuery<SiembraRetrasadaDto[]>({
    queryKey: alertsQueryKeys.byType("siembra-retrasada"),
    queryFn: alertService.fetchSiembraRetrasada,
    retry: 1,
  });
};

export const useFaltaGerminacion = () => {
  return useSuspenseQuery<FaltaGerminacionDto[]>({
    queryKey: alertsQueryKeys.byType("falta-germinacion"),
    queryFn: alertService.fetchFaltaGerminacion,
    retry: 1,
  });
};

export const useFaltantePlantas = () => {
  return useSuspenseQuery<FaltantePlantasDto[]>({
    queryKey: alertsQueryKeys.byType("faltante-plantas"),
    queryFn: alertService.fetchFaltantePlantas,
    retry: 1,
  });
};

export const useFaltaPreExpedicion = () => {
  return useSuspenseQuery<FaltaPreExpedicionDto[]>({
    queryKey: alertsQueryKeys.byType("falta-pre-expedicion"),
    queryFn: alertService.fetchFaltaPreExpedicion,
    retry: 1,
  });
};
