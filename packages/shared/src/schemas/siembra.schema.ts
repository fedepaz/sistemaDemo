// shared/src/schemas/siembra.dto.ts
import { z } from "zod";
import { LegacyHeaderSchema } from "./legacy-header.schema";

export const SiembraDtoSchema = LegacyHeaderSchema.extend({
  // Datos de la partida
  hai: z.string(), // hai (¿híbrido/injerto?)
  injerto: z.string(), // injerto
  con: z.string(), // con (cantidad de plantas)
  // Fechas
  fechaSugeridaSiembra: z.string(), // f_siem
  fechaSiembraReal: z.string(), // f_siembra
});

export type SiembraDto = z.infer<typeof SiembraDtoSchema>;

export const AsignarUbiSiembraDtoSchema = z.object({
  partida: z.number(),
  ano: z.number(),
  indice: z.number(),
  ubicacion: z.number().int().positive(),
  stock_ini: z.number().int().nonnegative(),
  baja: z.number().int().nonnegative().optional().default(0),
  detalle: z
    .string()
    .max(30, "El detalle no puede superar los 30 caracteres")
    .optional()
    .default(""),
  extendido: z.string().default(""),
  edita: z.string().optional(),
});

export type AsignarUbiSiembraDto = z.infer<typeof AsignarUbiSiembraDtoSchema>;
