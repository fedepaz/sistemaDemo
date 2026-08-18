// src/features/taskshift/api/taskShiftService.ts

import { clientFetch } from "@/lib/api/client-fetch";
import { CreateTaskShiftDto, TaskShiftDto } from "@vivero/shared";

export const taskShiftService = {
  fetchByEntityId: (entityId: string) => {
    return clientFetch<TaskShiftDto[]>(
      `task-shifts?entityId=${encodeURIComponent(entityId)}`,
      { method: "GET" },
    );
  },

  createTaskShift: (data: CreateTaskShiftDto) => {
    return clientFetch<TaskShiftDto>("task-shifts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
