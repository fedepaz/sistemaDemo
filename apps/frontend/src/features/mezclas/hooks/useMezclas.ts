// apps/frontend/src/features/mezclas/hooks/useMezclas.ts
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { CreateMezclaDto, MezclaDto } from "@vivero/shared";
import { toast } from "sonner";
import { mezclaService } from "../api/mezclaService";
import { mezclaQueryKeys } from "@/lib/queryKeys";
import { invalidateQueries } from "@/lib/query-invalidation-map";

export const useMezclas = () => {
  return useSuspenseQuery<MezclaDto[]>({
    queryKey: mezclaQueryKeys.all(),
    queryFn: mezclaService.fetchAll,
    retry: 1,
  });
};

export const useCreateMezcla = () => {
  const queryClient = useQueryClient();

  return useMutation<MezclaDto, Error, CreateMezclaDto>({
    mutationFn: mezclaService.create,
    onSuccess: () => {
      toast.success("Mezcla creada exitosamente", {
        duration: 3000,
      });
      invalidateQueries(queryClient, "createMezcla");
    },
  });
};
