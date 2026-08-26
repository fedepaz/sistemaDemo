// shared/src/schemas/mezcla.schema.ts

import { z } from "zod";

export const MezclaSchema = z.object({
  id: z.string(),
  sustrato1Id: z.string(),
  sustrato1Nombre: z.string(),
  porcentaje1: z.number(),
  sustrato2Id: z.string().nullable(),
  sustrato2Nombre: z.string().nullable(),
  porcentaje2: z.number().nullable(),
  sustrato3Id: z.string().nullable(),
  sustrato3Nombre: z.string().nullable(),
  porcentaje3: z.number().nullable(),
  sustrato4Id: z.string().nullable(),
  sustrato4Nombre: z.string().nullable(),
  porcentaje4: z.number().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export type MezclaDto = z.infer<typeof MezclaSchema>;

export const CreateMezclaSchema = z
  .object({
    sustrato1Id: z.string(),
    porcentaje1: z.number(),
    sustrato2Id: z.string().nullable(),
    porcentaje2: z.number().nullable(),
    sustrato3Id: z.string().nullable(),
    porcentaje3: z.number().nullable(),
    sustrato4Id: z.string().nullable(),
    porcentaje4: z.number().nullable(),
  })
  .refine(
    (data) => {
      const total =
        data.porcentaje1 +
        (data.porcentaje2 ?? 0) +
        (data.porcentaje3 ?? 0) +
        (data.porcentaje4 ?? 0);
      return total === 100;
    },
    { message: "Los porcentajes deben sumar 100%" },
  );

export type CreateMezclaDto = z.infer<typeof CreateMezclaSchema>;
