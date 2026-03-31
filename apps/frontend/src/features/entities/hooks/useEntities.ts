// src/features/entities/hooks/useEntities.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { CreateEntityDto, Entity } from "@vivero/shared";
import { toast } from "sonner";

export const entityQueryKeys = {
  all: () => ["entities"] as const,
  byName: (name: string) => [...entityQueryKeys.all(), "byName", name] as const,
  byLabel: (label: string) =>
    [...entityQueryKeys.all(), "byLabel", label] as const,
};

export const useEntities = () => {
  return useSuspenseQuery<Entity[]>({
    queryKey: entityQueryKeys.all(),
    queryFn: () => clientFetch<Entity[]>("entities/tables", { method: "GET" }),
    retry: 1, // Retry once to account for transient network issues
  });
};

export const useCreateEntity = () => {
  return useMutation<Entity, Error, CreateEntityDto>({
    mutationFn: async (entityData) => {
      const response = await clientFetch<Entity>(``, {
        method: "POST",
        body: JSON.stringify(entityData),
      });
      return response;
    },
    onSuccess: (data) => {
      const toastMessage = `Entidad ${data.name} creada exitosamente`;
      toast.success(toastMessage, {
        duration: 3000,
      });
    },
  });
};
