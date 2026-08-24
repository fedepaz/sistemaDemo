// shared/src/schemas/mezcla.schema.ts

import { z } from "zod";

export const MezclaSchema = z.object({
  id: z.string(),
  sustrato1Id: z.string(),
  porcentaje1: z.number(),
  sustrato2Id: z.string().nullable(),
  porcentaje2: z.number().nullable(),
  sustrato3Id: z.string().nullable(),
  porcentaje3: z.number().nullable(),
  sustrato4Id: z.string().nullable(),
  porcentaje4: z.number().nullable(),
});

export type MezclaDto = z.infer<typeof MezclaSchema>;

export const CreateMezclaSchema = z.object({
  sustrato1Id: z.string(),
  porcentaje1: z.number(),
  sustrato2Id: z.string().nullable(),
  porcentaje2: z.number().nullable(),
  sustrato3Id: z.string().nullable(),
  porcentaje3: z.number().nullable(),
  sustrato4Id: z.string().nullable(),
  porcentaje4: z.number().nullable(),
});

export type CreateMezclaDto = z.infer<typeof CreateMezclaSchema>;
