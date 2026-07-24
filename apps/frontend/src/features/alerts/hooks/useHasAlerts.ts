"use client";

import { useQuery } from "@tanstack/react-query";
import { alertService } from "../api/alertService";
import { alertsQueryKeys } from "@/lib/queryKeys";

export function useHasAlerts(canRead: boolean) {
  const siembra = useQuery({
    queryKey: alertsQueryKeys.byType("siembra-retrasada"),
    queryFn: alertService.fetchSiembraRetrasada,
    enabled: canRead,
    refetchInterval: 30_000,
    staleTime: 5 * 60 * 1000,
  });

  const germinacion = useQuery({
    queryKey: alertsQueryKeys.byType("falta-germinacion"),
    queryFn: alertService.fetchFaltaGerminacion,
    enabled: canRead,
    refetchInterval: 30_000,
    staleTime: 5 * 60 * 1000,
  });

  const faltante = useQuery({
    queryKey: alertsQueryKeys.byType("faltante-plantas"),
    queryFn: alertService.fetchFaltantePlantas,
    enabled: canRead,
    refetchInterval: 30_000,
    staleTime: 5 * 60 * 1000,
  });

  const preExpedicion = useQuery({
    queryKey: alertsQueryKeys.byType("falta-pre-expedicion"),
    queryFn: alertService.fetchFaltaPreExpedicion,
    enabled: canRead,
    refetchInterval: 30_000,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading =
    siembra.isLoading ||
    germinacion.isLoading ||
    faltante.isLoading ||
    preExpedicion.isLoading;

  const hasAlerts =
    (siembra.data?.length ?? 0) > 0 ||
    (germinacion.data?.length ?? 0) > 0 ||
    (faltante.data?.length ?? 0) > 0 ||
    (preExpedicion.data?.length ?? 0) > 0;

  return { hasAlerts, isLoading };
}
