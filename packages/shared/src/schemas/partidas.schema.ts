// shared/src/schemas/partidas.dto.ts
import { z } from "zod";

export const AsignarUbicacionDtoSchema = z.object({
  partida: z.number(),
  ano: z.number(),
  indice: z.number(),
  ubicacion: z.number().int().positive(),
  stock_ini: z.number().int().nonnegative(),
  detalle: z.string().optional().default(""), // undefined → ''
  baja: z.number().int().nonnegative().optional().default(0), // undefined → 0
  extendido: z.string(),
  edita: z.string().optional(), // solo para validación, no va a DB
});
export type AsignarUbicacionDto = z.infer<typeof AsignarUbicacionDtoSchema>;
