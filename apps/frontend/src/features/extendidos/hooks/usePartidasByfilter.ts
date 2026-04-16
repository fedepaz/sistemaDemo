// src/features/extendidos/hooks/usePartidasByfilter.ts
import { useQuery } from "@tanstack/react-query";
import { partidaService } from "../api/partidaService";
import type { PartidaDto } from "@vivero/shared";

export type FilterType =
  | "none"
  | "partida"
  | "fecha"
  | "fechaRange"
  | "ano"
  | "camara";

interface Filters {
  type: FilterType;
  value?: string | number;
  value2?: string | number; // solo para rango
  camaraId?: string; // Nuevo: para filtrar por cámara en fecha o rango
}

export function usePartidasWithFilters(filters: Filters) {
  return useQuery<PartidaDto[]>({
    queryKey: ["partidas", filters.type, filters.value, filters.value2, filters.camaraId],
    queryFn: async () => {
      let data: PartidaDto[] = [];

      switch (filters.type) {
        case "partida":
          const single = await partidaService.fetchByPartida(Number(filters.value));
          data = single ? [single] : [];
          break;
        case "fecha":
          data = await partidaService.fetchByFecha(filters.value as string);
          break;
        case "fechaRange":
          data = await partidaService.fetchByFechaRange(
            filters.value as string,
            filters.value2 as string,
          );
          break;
        case "ano":
          data = await partidaService.fetchByAno(Number(filters.value));
          break;
        case "camara":
          data = await partidaService.fetchByCamara(Number(filters.value));
          break;
        default:
          data = await partidaService.fetchAll();
      }

      // Cliente-side filtering for Camara if provided as an extra filter
      if (filters.camaraId && filters.type !== "camara") {
        return data.filter(p => p.greenhouseCode === filters.camaraId);
      }

      return data;
    },
    // Cache management for enterprise performance
    staleTime: 5 * 60 * 1000,
  });
}
