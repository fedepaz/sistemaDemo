// shared/src/schemas/siembra.dto.ts
import { z } from "zod";
import { LegacyHeaderSchema } from "./legacy-header.schema";

export const SiembraDtoSchema = LegacyHeaderSchema.extend({
  // Datos de la partida
  hai: z.string(), // hai (¿híbrido/injerto?)
  injerto: z.string(), // injerto

  // Fechas
  fechaSugeridaSiembra: z.string(), // f_siem
  propiedad: z.string(), // propiedad
  solicito: z.string(), // solicito
  nrocont: z.string(), // nrocont
  extendido: z.string(), // extendido
  germin: z.string(), // germin
});

export type SiembraDto = z.infer<typeof SiembraDtoSchema>;
