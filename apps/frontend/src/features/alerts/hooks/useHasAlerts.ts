"use client";

import { useQuery } from "@tanstack/react-query";
import { alertService } from "../api/alertService";
import { alertsQueryKeys } from "@/lib/queryKeys";

export function useHasAlerts(canRead: boolean) {
  // Polling deliberado: antes cada query se re-ejecutaba cada 30s desde cada
  // navegador abierto (4 requests cada 30s = presión innecesaria sobre el
  // backend). Ahora se usa el comportamiento por defecto de react-query:
  // refetch en focus/remount + staleTime. La insignia del header se mantiene
  // razonablemente fresca sin tráfico de fondo constante.
  const siembra = useQuery({
    queryKey: alertsQueryKeys.byType("siembra-retrasada"),
    queryFn: alertService.fetchSiembraRetrasada,
    enabled: canRead,
    staleTime: 5 * 60 * 1000,
  });

  const germinacion = useQuery({
    queryKey: alertsQueryKeys.byType("falta-germinacion"),
    queryFn: alertService.fetchFaltaGerminacion,
    enabled: canRead,
    staleTime: 5 * 60 * 1000,
  });

  const faltante = useQuery({
    queryKey: alertsQueryKeys.byType("faltante-plantas"),
    queryFn: alertService.fetchFaltantePlantas,
    enabled: canRead,
    staleTime: 5 * 60 * 1000,
  });

  const preExpedicion = useQuery({
    queryKey: alertsQueryKeys.byType("falta-pre-expedicion"),
    queryFn: alertService.fetchFaltaPreExpedicion,
    enabled: canRead,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading =
    siembra.isPending ||
    germinacion.isPending ||
    faltante.isPending ||
    preExpedicion.isPending;

  const hasAlerts =
    (siembra.data?.length ?? 0) > 0 ||
    (germinacion.data?.length ?? 0) > 0 ||
    (faltante.data?.length ?? 0) > 0 ||
    (preExpedicion.data?.length ?? 0) > 0;

  return { hasAlerts, isLoading };
}
