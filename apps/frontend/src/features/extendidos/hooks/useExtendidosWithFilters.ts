"use client";

import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ExtendidoDto } from "@vivero/shared";
import { extendidoService } from "../api/extendidoService";

export type FilterType = "none" | "enCamara" | "historico" | "all";

interface Filters {
  type: FilterType;
  value?: string;
  camaraId?: string;
}

/**
 * Hook to manage extendidos data with decoupled fetching and local filtering.
 *
 * Logic:
 * 1. fetchParams (type, value) trigger a server-side request via TanStack Query.
 * 2. camaraId triggers a client-side memoized filter for instant reactivity.
 */
export function useExtendidosWithFilters(filters: Filters) {
  const today = new Date(2025, 6, 3);
  const year = today.getFullYear();
  const month =
    today.getMonth() > 9 ? today.getMonth() + 1 : `0${today.getMonth() + 1}`;
  const day = today.getDate() > 9 ? today.getDate() : `0${today.getDate()}`;

  const query = useSuspenseQuery<ExtendidoDto[]>({
    queryKey: ["extendidos", filters.type, filters.value],
    queryFn: async () => {
      switch (filters.type) {
        case "enCamara":
          return await extendidoService.fetchExtendidosEnCamara();
        case "historico":
          return await extendidoService.fetchByFecha(
            filters.value || `${year}-${month}-${day}`,
          );
        case "all":
          return await extendidoService.fetchAllExtendidos();
        default:
          return await extendidoService.fetchExtendidosEnCamara();
      }
    },
  });

  // Local filtering by Chamber for instant reactivity
  const filteredData = useMemo(() => {
    const data = query.data || [];
    if (!filters.camaraId || filters.camaraId === "all") {
      return data;
    }

    const camaraIdNum = Number(filters.camaraId);
    return data.filter(
      (p) => Number(p.codigoCamaraGerminacion) === camaraIdNum,
    );
  }, [query.data, filters.camaraId]);

  return {
    ...query,
    data: filteredData,
    rawCount: query.data?.length || 0,
    filteredCount: filteredData.length,
  };
}
