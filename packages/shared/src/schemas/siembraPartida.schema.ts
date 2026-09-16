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
  })
  .refine((v) => v !== "0" && v !== "0.0" && v !== "0.00" && v !== "0.000", {
    message: "La profundidad debe ser mayor a 0",
  });

export const PrensadoSustratoValues = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6] as const;

export const SiembraPartidaSchema = LegacyHeaderSchema.extend({
  id: requiredCuid("El registro de siembra"),
  metodoMaquina: z.boolean({ message: "El método/máquina es requerido" }),
  prensadoSustrato: z
    .number({ message: "El prensado de sustrato es requerido" })
    .min(0, { message: "El prensado de sustrato debe ser mayor o igual a 0" })
    .max(6, { message: "El prensado de sustrato debe ser menor o igual a 6" })
    .refine((v) => PrensadoSustratoValues.includes(v as any), {
      message: "El prensado de sustrato debe ser un múltiplo de 0.5 (0, 0.5, 1, ... 6)",
    }),
  profundidadSemilla: ProfundidadSemillaSchema,
  tratamientoSemilla: z.string({
    message: "El tratamiento de semilla es requerido",
  }).min(1, { message: "El tratamiento de semilla es requerido" }),
  sustrato: z.string().optional(),
  sustratoNombre: z.string().optional(),
  mezclaId: requiredCuid("La mezcla"),
  userId: requiredCuid("El usuario"),
  mezclaNombre: z.string(),
  usuarioNombre: z.string(),
  createdByNombre: z.string().optional(),
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
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  })).optional(),
  createdAt: z.string().optional(),
});

export type SiembraPartidaDto = z.infer<typeof SiembraPartidaSchema>;

export const AutorizarSiembraSchema = PartidaHeaderSchema;

export type AutorizarSiembraDto = z.infer<typeof AutorizarSiembraSchema>;

export const CreateSiembraPartidaSchema = PartidaHeaderSchema.extend({
  metodoMaquina: z.boolean({
    message: "El método/máquina es requerido",
  }),
  prensadoSustrato: z
    .number({ message: "El prensado de sustrato es requerido" })
    .min(0, { message: "El prensado de sustrato debe ser mayor o igual a 0" })
    .max(6, { message: "El prensado de sustrato debe ser menor o igual a 6" })
    .refine((v) => PrensadoSustratoValues.includes(v as any), {
      message: "El prensado de sustrato debe ser un múltiplo de 0.5 (0, 0.5, 1, ... 6)",
    }),

  profundidadSemilla: ProfundidadSemillaSchema,
  tratamientoSemilla: z.string({
    message: "El tratamiento de semilla es requerido",
  }).min(1, { message: "El tratamiento de semilla es requerido" }),
  sustrato: z.string({ message: "El sustrato es requerido" }).min(1, { message: "El sustrato es requerido" }),
  startTime: z.string({ message: "La hora de inicio es requerida" }).min(1, { message: "La hora de inicio es requerida" }),
  endTime: z.string({ message: "La hora de fin es requerida" }).min(1, { message: "La hora de fin es requerida" }),
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
