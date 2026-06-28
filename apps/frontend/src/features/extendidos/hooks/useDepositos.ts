// src/features/extendidos/hooks/useDepositos.ts

import { useSuspenseQuery } from "@tanstack/react-query";
import { DepositoDto, depositosService } from "../api/depositosService";
import { depositosQueryKeys } from "@/lib/queryKeys";

export const useDepositos = () => {
  return useSuspenseQuery<DepositoDto[]>({
    queryKey: depositosQueryKeys.all(),
    queryFn: () => depositosService.fetchAll(),
    retry: 1,
  });
};

export const useCamaras = () => {
  return useSuspenseQuery<DepositoDto[]>({
    queryKey: depositosQueryKeys.byCamara(),
    queryFn: () => depositosService.fetchCamaras(),
    retry: 1,
  });
};

export const useDepositoByCodigo = (codigo: number) => {
  return useSuspenseQuery<DepositoDto | null>({
    queryKey: depositosQueryKeys.byCodigo(codigo),
    queryFn: () => depositosService.fetchByCodigo(codigo),
    retry: 1,
  });
};
