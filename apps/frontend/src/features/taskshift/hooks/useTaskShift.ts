// src/features/taskshift/hooks/useTaskShift.ts

import { useQuery } from "@tanstack/react-query";
import { TaskShiftDto } from "@vivero/shared";
import { taskShiftService } from "../api/taskShiftService";
import { taskShiftQueryKeys } from "@/lib/queryKeys";

export const useTaskShifts = (entityId: string) => {
  return useQuery<TaskShiftDto[], Error>({
    queryKey: taskShiftQueryKeys.byEntityId(entityId),
    queryFn: () => taskShiftService.fetchByEntityId(entityId),
    enabled: !!entityId,
  });
};
