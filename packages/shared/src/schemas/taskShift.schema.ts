// shared/src/schemas/taskShift.schema.ts

import z from "zod";

export const TaskShiftSchema = z.object({
  id: z.string(),
  createdByUserId: z.string(),
  entityId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  employees: z.array(z.object({ userId: z.string() })),
});

export type TaskShiftDto = z.infer<typeof TaskShiftSchema>;

export const CreateTaskShiftSchema = z.object({
  entityId: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  employeeUserIds: z.array(z.string().min(1)).min(1),
});

export type CreateTaskShiftDto = z.infer<typeof CreateTaskShiftSchema>;

export const UpdateTaskShiftSchema = z.object({
  entityId: z.string().min(1).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  employeeUserIds: z.array(z.string().min(1)).optional(),
});

export type UpdateTaskShiftDto = z.infer<typeof UpdateTaskShiftSchema>;
