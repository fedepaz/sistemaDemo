// src/features/extendidos/hooks/useDepositos.ts

import { useSuspenseQuery } from "@tanstack/react-query";
import { DepositoDto, depositosService } from "../api/depositosService";

export const depositosQueryKeys = {
  all: () => ["depositos"] as const,
  byCamara: (camara: number) =>
    [...depositosQueryKeys.all(), "byCamara", camara] as const,
};

export const useDepositos = () => {
  return useSuspenseQuery<DepositoDto[]>({
    queryKey: depositosQueryKeys.all(),
    queryFn: () => depositosService.fetchAll(),
    retry: 1,
  });
};

export const useDepositosByCamara = (camara: number) => {
  return useSuspenseQuery<DepositoDto[]>({
    queryKey: depositosQueryKeys.byCamara(camara),
    queryFn: () => depositosService.fetchCamaras(),
    retry: 1,
  });
};

export const useDepositoByCodigo = (codigo: number) => {
  return useSuspenseQuery<DepositoDto | null>({
    queryKey: depositosQueryKeys.byCamara(codigo),
    queryFn: () => depositosService.fetchByCodigo(codigo),
    retry: 1,
  });
};
