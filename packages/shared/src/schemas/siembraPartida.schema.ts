// shared/src/schemas/siembraPartida.ts

import { z } from "zod";
import { LegacyHeaderSchema, PartidaHeaderSchema } from "./legacy-header.schema";
import { cuidSchema, requiredCuid } from "./cuid.schema";

const profundidadSemillaRegex = /^\d{1,2}(\.\d{1,3})?$/;

export const ProfundidadSemillaSchema = z
  .string({ message: "La profundidad de semilla es requerida" })
  .min(1, { message: "La profundidad de semilla es requerida" })
  .regex(profundidadSemillaRegex, {
    message:
      "La profundidad debe tener el formato: 1.525 (1-2 dígitos, hasta 3 decimales)",
  });

export const SiembraPartidaSchema = LegacyHeaderSchema.extend({
  id: requiredCuid("El registro de siembra"),
  metodoMaquina: z.boolean({ message: "El método/máquina es requerido" }),
  presionSemilla: z
    .number({ message: "La presión de semilla es requerida" })
    .int({ message: "La presión de semilla debe ser un número entero" }),
  profundidadSemilla: ProfundidadSemillaSchema,
  tratamientoSemilla: z.string({
    message: "El tratamiento de semilla es requerido",
  }).min(1, { message: "El tratamiento de semilla es requerido" }),
  mezclaId: requiredCuid("La mezcla"),
  userId: requiredCuid("El usuario"),
  mezclaNombre: z.string(),
  usuarioNombre: z.string(),
  // Legacy siembra fields
  cg: z.number().optional(),
  fSiembra: z.string().optional(),
  lote: z.number().optional(),
  anoLote: z.number().optional(),
  item: z.number().optional(),
  semxgr: z.number().optional(),
  ajuste: z.string().optional(),
  cantidadGrs: z.number().optional(),
  cantidaNroCont: z.number().optional(),
  detalleExtendido: z.string().optional(),
  // Stock traceability
  stockLote: z.number().optional(),
  stockAnio: z.number().optional(),
  stockEntradasAntes: z.number().optional(),
  stockSalidasAntes: z.number().optional(),
  stockEntradasDespues: z.number().optional(),
  stockSalidasDespues: z.number().optional(),
  // Resolved names
  tratamientoNombre: z.string().optional(),
  // Task shift fields
  entityId: z.string().optional(),
  entityNombre: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  empleados: z.array(z.object({
    userId: z.string(),
    username: z.string(),
  })).optional(),
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
  tratamientoSemilla: z.string({
    message: "El tratamiento de semilla es requerido",
  }).min(1, { message: "El tratamiento de semilla es requerido" }),
  mezclaId: cuidSchema.optional(),
  // Stock traceability
  stockLote: z.number().optional(),
  stockAnio: z.number().optional(),
  stockEntradasAntes: z.number().optional(),
  stockSalidasAntes: z.number().optional(),
  stockEntradasDespues: z.number().optional(),
  stockSalidasDespues: z.number().optional(),
});

export type CreateSiembraPartidaDto = z.infer<
  typeof CreateSiembraPartidaSchema
>;
