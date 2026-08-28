// shared/src/schemas/mezcla.schema.ts

import { z } from "zod";
import { requiredCuid } from "./cuid.schema";

export const MezclaSchema = z.object({
  id: requiredCuid("La mezcla"),
  sustrato1Id: requiredCuid("El sustrato 1"),
  sustrato1Nombre: z.string(),
  porcentaje1: z.number(),
  sustrato2Id: requiredCuid("El sustrato 2").nullable(),
  sustrato2Nombre: z.string().nullable(),
  porcentaje2: z.number().nullable(),
  sustrato3Id: requiredCuid("El sustrato 3").nullable(),
  sustrato3Nombre: z.string().nullable(),
  porcentaje3: z.number().nullable(),
  sustrato4Id: requiredCuid("El sustrato 4").nullable(),
  sustrato4Nombre: z.string().nullable(),
  porcentaje4: z.number().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export type MezclaDto = z.infer<typeof MezclaSchema>;

export const CreateMezclaSchema = z
  .object({
    sustrato1Id: requiredCuid("El sustrato 1"),
    porcentaje1: z.number({ required_error: "El porcentaje 1 es requerido" }),
    sustrato2Id: requiredCuid("El sustrato 2").nullable(),
    porcentaje2: z.number().nullable(),
    sustrato3Id: requiredCuid("El sustrato 3").nullable(),
    porcentaje3: z.number().nullable(),
    sustrato4Id: requiredCuid("El sustrato 4").nullable(),
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
