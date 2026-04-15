// src/features/entities/hooks/useEntities.ts

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { CreateEntityDto, Entity } from "@vivero/shared";
import { toast } from "sonner";
import { entityService } from "../api/entityService";

export const entityQueryKeys = {
  all: () => ["entities"] as const,
  byName: (name: string) => [...entityQueryKeys.all(), "byName", name] as const,
  byLabel: (label: string) =>
    [...entityQueryKeys.all(), "byLabel", label] as const,
};

export const useEntities = () => {
  return useSuspenseQuery<Entity[]>({
    queryKey: entityQueryKeys.all(),
    queryFn: entityService.fetchAll,
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useCreateEntity = () => {
  return useMutation<Entity, Error, CreateEntityDto>({
    mutationFn: entityService.create,
    onSuccess: (data) => {
      const toastMessage = `Entidad ${data.name} creada exitosamente`;
      toast.success(toastMessage, {
        duration: 3000,
      });
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
      queryClient.invalidateQueries({ queryKey: entityQueryKeys.all() });
    },
  });
};
