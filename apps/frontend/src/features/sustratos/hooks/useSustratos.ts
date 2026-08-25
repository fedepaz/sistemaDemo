// apps/frontend/src/features/sustratos/hooks/useSustratos.ts
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { CreateSustratoDto, SustratoDto } from "@vivero/shared";
import { toast } from "sonner";
import { sustratoService } from "../api/sustratoService";
import { sustratoQueryKeys } from "@/lib/queryKeys";
import { invalidateQueries } from "@/lib/query-invalidation-map";

export const useSustratos = () => {
  return useSuspenseQuery<SustratoDto[]>({
    queryKey: sustratoQueryKeys.all(),
    queryFn: sustratoService.fetchAll,
    retry: 1,
  });
};

export const useCreateSustrato = () => {
  const queryClient = useQueryClient();

  return useMutation<SustratoDto, Error, CreateSustratoDto>({
    mutationFn: sustratoService.create,
    onSuccess: (data) => {
      toast.success(`Sustrato ${data.nombre} creado exitosamente`, {
        duration: 3000,
      });
      invalidateQueries(queryClient, "createSustrato");
    },
  });
};
