// shared/src/schemas/programacionSiembra.dto.ts
import { z } from "zod";
import { LegacyHeaderSchema } from "./legacy-header.schema";

export const ProgramacionSiembraDtoSchema = LegacyHeaderSchema.extend({
  // Datos de la partida
  propiedad: z.string(),
  injerto: z.string(),
  nrocont: z.string(),
  sem_siembra: z.string(),
  fechaSugeridaSiembra: z.string(), // f_siem
  fechaSiembraReal: z.string(), // f_siembra
  semEntrega: z.string(),
  lote: z.string(),
  anoLote: z.string(),
  item: z.number(),
  semxgr: z.string(),
  c: z.string(),
  g: z.string(),
  diasCamara: z.string().optional(),
  rubroNombre: z.string().optional(),
});

export type ProgramacionSiembraDto = z.infer<typeof ProgramacionSiembraDtoSchema>;

export const TratamientoDtoSchema = z.object({
  codigo: z.string(),
  nombre: z.string(),
  precio: z.string(),
});

export type TratamientoDto = z.infer<typeof TratamientoDtoSchema>;

export const LegacySustratoDtoSchema = z.object({
  codigo: z.string(),
  nombre: z.string(),
  unidad: z.string(),
});

export type LegacySustratoDto = z.infer<typeof LegacySustratoDtoSchema>;
