// shared/src/schemas/taskShift.schema.ts

import z from "zod";
import { PartidaHeaderSchema } from "./legacy-header.schema";
import { cuidSchema } from "./cuid.schema";

export const TaskShiftSchema = PartidaHeaderSchema.extend({
  id: cuidSchema,
  createdByUserId: cuidSchema,
  entityId: cuidSchema,
  startTime: z.string(),
  endTime: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  employees: z.array(z.object({ userId: cuidSchema })),
});

export type TaskShiftDto = z.infer<typeof TaskShiftSchema>;

export const CreateTaskShiftBaseSchema = PartidaHeaderSchema.extend({
  entityId: cuidSchema,
  startTime: z.string().min(1, "La hora de inicio es requerida"),
  endTime: z.string().min(1, "La hora de fin es requerida"),
  employeeUserIds: z.array(cuidSchema).min(0).default([]),
});

export const CreateTaskShiftSchema = CreateTaskShiftBaseSchema.refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  {
    message: "La hora de fin debe ser posterior a la hora de inicio",
    path: ["endTime"],
  },
);

export type CreateTaskShiftDto = z.infer<typeof CreateTaskShiftSchema>;

export const UpdateTaskShiftSchema = z.object({
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  employeeUserIds: z.array(cuidSchema).optional(),
});

export type UpdateTaskShiftDto = z.infer<typeof UpdateTaskShiftSchema>;
