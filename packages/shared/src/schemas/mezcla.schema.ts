// shared/src/schemas/mezcla.schema.ts

import { z } from "zod";
import { cuidSchema, nullableCuidSchema } from "./cuid.schema";

export const MezclaSchema = z.object({
  id: cuidSchema,
  sustrato1Id: cuidSchema,
  sustrato1Nombre: z.string(),
  porcentaje1: z.number(),
  sustrato2Id: nullableCuidSchema,
  sustrato2Nombre: z.string().nullable(),
  porcentaje2: z.number().nullable(),
  sustrato3Id: nullableCuidSchema,
  sustrato3Nombre: z.string().nullable(),
  porcentaje3: z.number().nullable(),
  sustrato4Id: nullableCuidSchema,
  sustrato4Nombre: z.string().nullable(),
  porcentaje4: z.number().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export type MezclaDto = z.infer<typeof MezclaSchema>;

export const CreateMezclaSchema = z
  .object({
    sustrato1Id: cuidSchema,
    porcentaje1: z.number(),
    sustrato2Id: nullableCuidSchema,
    porcentaje2: z.number().nullable(),
    sustrato3Id: nullableCuidSchema,
    porcentaje3: z.number().nullable(),
    sustrato4Id: nullableCuidSchema,
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
