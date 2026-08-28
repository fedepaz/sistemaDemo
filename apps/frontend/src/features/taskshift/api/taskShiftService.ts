// src/features/taskshift/api/taskShiftService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { TaskShiftDto } from "@vivero/shared";

export const taskShiftService = {
  fetchByEntityId: (entityId: string) => {
    return clientFetch<TaskShiftDto[]>(
      `task-shifts?entityId=${encodeURIComponent(entityId)}`,
      { method: "GET" },
    );
  },
};
