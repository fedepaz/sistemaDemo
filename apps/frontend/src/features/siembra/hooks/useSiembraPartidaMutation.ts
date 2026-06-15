// apps/frontend/src/features/siembra/hooks/useSiembraPartidaMutation.ts
"use client";

import { AsignarUbicacionDto } from "@vivero/shared";

/**
 * Hook for administrative partida ubicacion assignment.
 * Unlike public partida ubicacion assignment, this does NOT automatically sign in the newly created user.
 */
export const useSiembraPartidaMutation = (data: AsignarUbicacionDto) => {
  return console.log("usePartidaMutation", data);
};
