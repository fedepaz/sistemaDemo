// shared/src/schemas/siembraPartida.ts

import { z } from "zod";
import { PartidaHeaderSchema } from "./legacy-header.schema";
import { requiredCuid } from "./cuid.schema";

const profundidadSemillaRegex = /^\d{1,2}(\.\d{1,3})?$/;

export const ProfundidadSemillaSchema = z
  .string({ message: "La profundidad de semilla es requerida" })
  .min(1, { message: "La profundidad de semilla es requerida" })
  .regex(profundidadSemillaRegex, {
    message:
      "La profundidad debe tener el formato: 1.525 (1-2 dígitos, hasta 3 decimales)",
  });

export const SiembraPartidaSchema = PartidaHeaderSchema.extend({
  id: requiredCuid("El registro de siembra"),
  metodoMaquina: z.boolean({ message: "El método/máquina es requerido" }),
  presionSemilla: z
    .number({ message: "La presión de semilla es requerida" })
    .int({ message: "La presión de semilla debe ser un número entero" }),
  profundidadSemilla: ProfundidadSemillaSchema,
  tratamientoSemilla: z.boolean({
    message: "El tratamiento de semilla es requerido",
  }),
  mezclaId: requiredCuid("La mezcla"),
  userId: requiredCuid("El usuario"),
});

export type SiembraPartidaDto = z.infer<typeof SiembraPartidaSchema>;

export const CreateSiembraPartidaSchema = PartidaHeaderSchema.extend({
  metodoMaquina: z.boolean({
    message: "El método/máquina es requerido",
  }),
  presionSemilla: z
    .number({ message: "La presión de semilla es requerida" })
    .int({ message: "La presión de semilla debe ser un número entero" })
    .min(1, { message: "La presión de semilla debe ser mayor a 0" }),

  profundidadSemilla: ProfundidadSemillaSchema,
  tratamientoSemilla: z.boolean({
    message: "El tratamiento de semilla es requerido",
  }),
  mezclaId: requiredCuid("La mezcla"),
});

export type CreateSiembraPartidaDto = z.infer<
  typeof CreateSiembraPartidaSchema
>;
