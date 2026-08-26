// shared/src/schemas/taskShift.schema.ts

import z from "zod";
import { PartidaHeaderSchema } from "./legacy-header.schema";

export const TaskShiftSchema = PartidaHeaderSchema.extend({
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

export const CreateTaskShiftSchema = PartidaHeaderSchema.extend({
  entityId: z.string().min(1, "La entidad es requerida"),
  startTime: z.string().min(1, "La hora de inicio es requerida"),
  endTime: z.string().min(1, "La hora de fin es requerida"),
  employeeUserIds: z.array(z.string().min(1)).min(0).default([]),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
  message: "La hora de fin debe ser posterior a la hora de inicio",
  path: ["endTime"],
});

export type CreateTaskShiftDto = z.infer<typeof CreateTaskShiftSchema>;

export const UpdateTaskShiftSchema = z.object({
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  employeeUserIds: z.array(z.string().min(1)).optional(),
});

export type UpdateTaskShiftDto = z.infer<typeof UpdateTaskShiftSchema>;
