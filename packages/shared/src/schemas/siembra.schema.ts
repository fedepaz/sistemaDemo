// shared/src/schemas/siembra.dto.ts
import { z } from "zod";
import { LegacyHeaderSchema } from "./legacy-header.schema";

export const SiembraDtoSchema = LegacyHeaderSchema.extend({
  // Datos de la partida
  hai: z.string(), // hai (¿híbrido/injerto?)
  injerto: z.string(), // injerto

  fechaSugeridaSiembra: z.string(), // f_siem
  fechaSiembraReal: z.string(), // f_siembra
  propiedad: z.string(), // propiedad
  solicito: z.string(), // solicito
  lote: z.string(), // lote
  anoLote: z.string(), // ano_lote
  ajuste: z.string(), // ajuste
  nrocont: z.string(), // nrocont
  extendido: z.string(), // extendido
  germin: z.string(), // germin
});

export type SiembraDto = z.infer<typeof SiembraDtoSchema>;
