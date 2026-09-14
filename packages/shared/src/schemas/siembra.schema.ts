// shared/src/schemas/siembra.dto.ts
import { z } from "zod";
import { LegacyHeaderSchema } from "./legacy-header.schema";

export const SiembraDtoSchema = LegacyHeaderSchema.extend({
  // Datos de la partida
  propiedad: z.string(),
  injerto: z.string(),
  nrocont: z.string(),
  sem_siembra: z.string(),
  fechaSugeridaSiembra: z.string(), // f_siem
  fechaSiembraReal: z.string(), // f_siembra
  lote: z.string(),
  anoLote: z.string(),
  item: z.number(),
  semxgr: z.string(),
  c: z.string(),
  g: z.string(),
});

export type SiembraDto = z.infer<typeof SiembraDtoSchema>;

export const TratamientoDtoSchema = z.object({
  codigo: z.string(),
  nombre: z.string(),
  precio: z.string(),
});

export type TratamientoDto = z.infer<typeof TratamientoDtoSchema>;
