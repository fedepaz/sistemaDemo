// shared/src/schemas/sustratos.schema.ts

import { z } from "zod";

export const SustratoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  createdAt: z.date(),
});

export type SustratoDto = z.infer<typeof SustratoSchema>;

export const CreateSustratoSchema = z.object({
  nombre: z.string(),
});

export type CreateSustratoDto = z.infer<typeof CreateSustratoSchema>;

export const UpdateSustratoSchema = z.object({
  nombre: z.string().optional(),
});

export type UpdateSustratoDto = z.infer<typeof UpdateSustratoSchema>;
