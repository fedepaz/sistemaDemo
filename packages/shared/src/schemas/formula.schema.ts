// shared/src/schemas/formula.schema.ts

import { z } from "zod";
import { requiredCuid } from "./cuid.schema";

export const FormulaSchema = z.object({
  id: requiredCuid("La fórmula"),
  producto1Id: requiredCuid("El sustrato 1"),
  producto1Nombre: z.string(),
  porcentaje1: z.number(),
  producto2Id: requiredCuid("El sustrato 2").nullable(),
  producto2Nombre: z.string().nullable(),
  porcentaje2: z.number().nullable(),
  producto3Id: requiredCuid("El sustrato 3").nullable(),
  producto3Nombre: z.string().nullable(),
  porcentaje3: z.number().nullable(),
  producto4Id: requiredCuid("El sustrato 4").nullable(),
  producto4Nombre: z.string().nullable(),
  porcentaje4: z.number().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export type FormulaDto = z.infer<typeof FormulaSchema>;

export const CreateFormulaSchema = z
  .object({
    producto1Id: requiredCuid("El sustrato 1"),
    porcentaje1: z.number({ required_error: "El porcentaje 1 es requerido" }),
    producto2Id: requiredCuid("El sustrato 2").nullable(),
    porcentaje2: z.number().nullable(),
    producto3Id: requiredCuid("El sustrato 3").nullable(),
    porcentaje3: z.number().nullable(),
    producto4Id: requiredCuid("El sustrato 4").nullable(),
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

export type CreateFormulaDto = z.infer<typeof CreateFormulaSchema>;
