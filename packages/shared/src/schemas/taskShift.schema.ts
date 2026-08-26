// shared/src/schemas/taskShift.schema.ts

import z from "zod";
import { PartidaHeaderSchema } from "./legacy-header.schema";
import { requiredCuid } from "./cuid.schema";

export const TaskShiftSchema = PartidaHeaderSchema.extend({
  id: requiredCuid("El turno"),
  createdByUserId: requiredCuid("El usuario creador"),
  entityId: requiredCuid("La entidad"),
  startTime: z.string(),
  endTime: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  employees: z.array(z.object({ userId: requiredCuid("El empleado") })),
});

export type TaskShiftDto = z.infer<typeof TaskShiftSchema>;

export const CreateTaskShiftBaseSchema = PartidaHeaderSchema.extend({
  entityId: requiredCuid("La entidad"),
  startTime: z
    .string({ message: "La hora de inicio es requerida" })
    .min(1, { message: "La hora de inicio es requerida" }),
  endTime: z
    .string({ message: "La hora de fin es requerida" })
    .min(1, { message: "La hora de fin es requerida" }),
  employeeUserIds: z.array(requiredCuid("El empleado")).min(0).default([]),
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
  employeeUserIds: z.array(requiredCuid("El empleado")).optional(),
});

export type UpdateTaskShiftDto = z.infer<typeof UpdateTaskShiftSchema>;
