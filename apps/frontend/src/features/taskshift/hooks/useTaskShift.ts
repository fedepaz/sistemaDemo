// src/features/taskshift/hooks/useTaskShift.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateTaskShiftDto, TaskShiftDto } from "@vivero/shared";
import { taskShiftService } from "../api/taskShiftService";
import { taskShiftQueryKeys } from "@/lib/queryKeys";
import { invalidateQueries } from "@/lib/query-invalidation-map";
import { toast } from "sonner";

export const useTaskShifts = (entityId: string) => {
  return useQuery<TaskShiftDto[], Error>({
    queryKey: taskShiftQueryKeys.byEntityId(entityId),
    queryFn: () => taskShiftService.fetchByEntityId(entityId),
    enabled: !!entityId,
  });
};

export const useCreateTaskShift = () => {
  const queryClient = useQueryClient();

  return useMutation<TaskShiftDto, Error, CreateTaskShiftDto>({
    mutationFn: taskShiftService.createTaskShift,
    onSuccess: () => {
      toast.success("Tarea creada exitosamente", {
        duration: 3000,
      });
      invalidateQueries(queryClient, "createTaskShift");
    },
    onError: () => {
      toast.error("Error al crear la tarea. Intenta de nuevo.", {
        duration: 4000,
      });
    },
  });
};
