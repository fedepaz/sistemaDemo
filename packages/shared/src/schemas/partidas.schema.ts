// shared/src/schemas/partidas.dto.ts
import { z } from "zod";

export const AsignarUbiExtendidoDtoSchema = z.object({
  partida: z.number(),
  ano: z.number(),
  indice: z.number(),
  ubicacion: z.number().int().positive(),
  stock_ini: z.number().int().nonnegative(),
  detalle: z
    .string()
    .max(30, "El detalle no puede superar los 30 caracteres")
    .optional()
    .default(""),
  baja: z.number().int().nonnegative().optional().default(0),
  extendido: z.string().default(""), // For long notes
  edita: z.string().optional(),
});
export type AsignarUbiExtendidoDto = z.infer<
  typeof AsignarUbiExtendidoDtoSchema
>;

export const AsignarUbiSiembraDtoSchema = z.object({
  partida: z.number(),
  ano: z.number(),
  indice: z.number(),
  cg: z.number().int().positive(),
  cantidaNroCont: z.number().int().positive(),
  f_siembra: z.coerce.date(),
  detalle: z
    .string()
    .max(30, "El detalle no puede superar los 30 caracteres")
    .optional()
    .default(""),
  edita: z.string().optional(),
});

export type AsignarUbiSiembraDto = z.infer<typeof AsignarUbiSiembraDtoSchema>;
