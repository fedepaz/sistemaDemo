// apps/frontend/src/features/extendidos/hooks/useExtendidosWithFilters.ts
"use client";

import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ExtendidoDto } from "@vivero/shared";
import { extendidoService } from "../api/extendidoService";

/**
 * Hook to manage extendidos data.
 * Always fetches records "in chamber" and applies local filtering by camaraId.
 */
export function useExtendidos(camaraId: string = "all") {
  const query = useSuspenseQuery<ExtendidoDto[]>({
    queryKey: ["extendidos", "enCamara"],
    queryFn: extendidoService.fetchExtendidosEnCamara,
  });

  // Local filtering by Chamber for instant reactivity
  const filteredData = useMemo(() => {
    const data = query.data || [];
    if (!camaraId || camaraId === "all") {
      return data;
    }

    const camaraIdNum = Number(camaraId);
    return data.filter(
      (p) => Number(p.codigoCamaraGerminacion) === camaraIdNum,
    );
  }, [query.data, camaraId]);

  return {
    ...query,
    data: filteredData,
    rawCount: query.data?.length || 0,
    filteredCount: filteredData.length,
  };
}
