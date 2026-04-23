// src/features/extendidos/hooks/usePartidasByfilter.ts

import { useSuspenseQuery } from "@tanstack/react-query";
import { ExtendidoDto } from "@vivero/shared";
import { extendidoService } from "../api/extendidoService";
import { partidaService } from "../api/partidaService";

export type FilterType = "none" | "fecha" | "camara" | "all";

interface Filters {
  type: FilterType;
  value?: string | number;
  camaraId?: string; // Nuevo: para filtrar por cámara en fecha o rango
}

export function useExtendidosWithFilters(filters: Filters) {
  const today = new Date(2025, 6, 3);
  const year = today.getFullYear();
  const month =
    today.getMonth() > 9 ? today.getMonth() + 1 : `0${today.getMonth() + 1}`;
  const day = today.getDate() > 9 ? today.getDate() : `0${today.getDate()}`;

  return useSuspenseQuery<ExtendidoDto[]>({
    queryKey: ["partidas", filters.type, filters.value, filters.camaraId],
    queryFn: async () => {
      let data: ExtendidoDto[] = [];

      switch (filters.type) {
        case "fecha":
          data = await extendidoService.fetchByFecha(filters.value as string);
          break;
        case "all":
          data = await extendidoService.fetchAllExtendidos();
          break;
        case "camara":
          data = await partidaService.fetchByCamara(Number(filters.camaraId));
          break;
        default:
          data = await extendidoService.fetchExtendidosEnCamara(
            `${year}-${month}-${day}`,
          );
      }

      // Cliente-side filtering for Camara if provided as an extra filter
      if (filters.camaraId && filters.type !== "camara") {
        return data.filter((p) => p.greenhouseCode === filters.camaraId);
      }

      return data;
    },
    // Cache management for enterprise performance
    staleTime: 5 * 60 * 1000,
  });
}
