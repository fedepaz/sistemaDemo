// src/features/entities/hooks/useEntities.ts

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { CreateEntityDto, Entity } from "@vivero/shared";
import { toast } from "sonner";
import { entityService } from "../api/entityService";
import { entityQueryKeys } from "@/lib/queryKeys";
import { invalidateQueries } from "@/lib/query-invalidation-map";

export const useEntities = () => {
  return useSuspenseQuery<Entity[]>({
    queryKey: entityQueryKeys.all(),
    queryFn: entityService.fetchAll,
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useCreateEntity = () => {
  const queryClient = useQueryClient();

  return useMutation<Entity, Error, CreateEntityDto>({
    mutationFn: entityService.create,
    onSuccess: (data) => {
      const toastMessage = `Entidad ${data.name} creada exitosamente`;
      toast.success(toastMessage, {
        duration: 3000,
      });
      invalidateQueries(queryClient, "createEntity");
    },
  });
};

export const useDeleteEntity = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: entityService.delete,
    onSuccess: () => {
      const toastMessage = `Entidad eliminada exitosamente`;
      toast.success(toastMessage, {
        duration: 3000,
      });
      invalidateQueries(queryClient, "deleteEntity");
    },
  });
};
