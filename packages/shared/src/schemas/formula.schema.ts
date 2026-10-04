// shared/src/schemas/formula.schema.ts

import { z } from "zod";
import { requiredCuid } from "./cuid.schema";

export const FormulaSchema = z.object({
  id: requiredCuid("La fórmula"),
  producto1Id: requiredCuid("El producto 1"),
  producto1Nombre: z.string(),
  porcentaje1: z.number(),
  producto2Id: requiredCuid("El producto 2").nullable(),
  producto2Nombre: z.string().nullable(),
  porcentaje2: z.number().nullable(),
  producto3Id: requiredCuid("El producto 3").nullable(),
  producto3Nombre: z.string().nullable(),
  porcentaje3: z.number().nullable(),
  producto4Id: requiredCuid("El producto 4").nullable(),
  producto4Nombre: z.string().nullable(),
  porcentaje4: z.number().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
  deletedByUserId: z.string().nullable(),
  deletedByUsername: z.string().nullable(),
});

export type FormulaDto = z.infer<typeof FormulaSchema>;

export const CreateFormulaSchema = z
  .object({
    producto1Id: requiredCuid("El producto 1"),
    porcentaje1: z
      .number({ required_error: "El porcentaje 1 es requerido" })
      .int()
      .min(0)
      .max(100),
    producto2Id: requiredCuid("El producto 2").nullable(),
    porcentaje2: z.number().int().min(0).max(100).nullable(),
    producto3Id: requiredCuid("El producto 3").nullable(),
    porcentaje3: z.number().int().min(0).max(100).nullable(),
    producto4Id: requiredCuid("El producto 4").nullable(),
    porcentaje4: z.number().int().min(0).max(100).nullable(),
  })
  .superRefine((data, ctx) => {
    // Pair integrity: a filled slot needs its percentage and vice versa
    for (const n of [2, 3, 4] as const) {
      const id = data[`producto${n}Id`];
      const pct = data[`porcentaje${n}`];
      if ((id === null) !== (pct === null)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cada producto debe tener su porcentaje",
          path: [id === null ? `producto${n}Id` : `porcentaje${n}`],
        });
      }
    }

    // Distinct slots: no product may appear twice
    const seen = new Set<string>();
    for (const n of [1, 2, 3, 4] as const) {
      const id = data[`producto${n}Id`];
      if (id === null) continue;
      if (seen.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "No se puede repetir el mismo producto",
          path: [`producto${n}Id`],
        });
      }
      seen.add(id);
    }
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
