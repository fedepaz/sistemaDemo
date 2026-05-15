// shared/src/schemas/partidas.dto.ts
import { z } from "zod";

export const AsignarUbicacionDtoSchema = z.object({
  partida: z.number(),
  ano: z.number(),
  indice: z.number(),
  ubicacion: z.number().int().positive(),
  stock_ini: z.number().int().nonnegative(),
  detalle: z.string().max(30, "El detalle no puede superar los 30 caracteres").optional().default(""), 
  baja: z.number().int().nonnegative().optional().default(0), 
  extendido: z.string().default(""), // For long notes
  edita: z.string().optional(), 
});
export type AsignarUbicacionDto = z.infer<typeof AsignarUbicacionDtoSchema>;
