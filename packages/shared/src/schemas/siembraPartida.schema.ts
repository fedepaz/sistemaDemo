// shared/src/schemas/siembraPartida.ts

import { z } from "zod";
import { PartidaHeaderSchema } from "./legacy-header.schema";

const profundidadSemillaRegex = /^\d{1,2}(\.\d{1,3})?$/;

export const ProfundidadSemillaSchema = z
  .string()
  .regex(
    profundidadSemillaRegex,
    "Format: 1.525 (1-2 digits, optional 1-3 decimals)",
  );

export const SiembraPartidaSchema = PartidaHeaderSchema.extend({
  id: z.string(),
  metodoMaquina: z.boolean(),
  presionSemilla: z.number().int(),
  profundidadSemilla: ProfundidadSemillaSchema,
  tratamientoSemilla: z.boolean(),
  mezclaId: z.string(),
  userId: z.string(),
});

export type SiembraPartidaDto = z.infer<typeof SiembraPartidaSchema>;

export const CreateSiembraPartidaSchema = PartidaHeaderSchema.extend({
  metodoMaquina: z.boolean(),
  presionSemilla: z.number().int(),
  profundidadSemilla: ProfundidadSemillaSchema,
  tratamientoSemilla: z.boolean(),
  mezclaId: z.string(),
});

export type CreateSiembraPartidaDto = z.infer<
  typeof CreateSiembraPartidaSchema
>;
