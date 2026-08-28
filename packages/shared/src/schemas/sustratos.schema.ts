// shared/src/schemas/sustratos.schema.ts

import { z } from "zod";
import { requiredCuid } from "./cuid.schema";

export const SustratoSchema = z.object({
  id: requiredCuid("El sustrato"),
  nombre: z.string(),
  createdAt: z.date(),
});

export type SustratoDto = z.infer<typeof SustratoSchema>;

export const CreateSustratoSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre del sustrato es requerido" }),
});

export type CreateSustratoDto = z.infer<typeof CreateSustratoSchema>;

export const UpdateSustratoSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre del sustrato es requerido" }).optional(),
});

export type UpdateSustratoDto = z.infer<typeof UpdateSustratoSchema>;
