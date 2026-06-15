// shared/src/schemas/siembra.dto.ts
import { z } from "zod";

export const SiembraDtoSchema = z.object({
  // Identificadores
  partidaId: z.number(), // partida
  anio: z.number(), // ano
  indice: z.number(), // indice (sub-partida)

  // Datos de la partida
  hai: z.string(), // hai (¿híbrido/injerto?)
  con: z.number(), // con (¿conteo de algo?)
  codigoEspecie: z.string(), // espvar
  nombreEspecie: z.string(), // especieNombre
  injerto: z.string(), // injerto
  contenedor: z.string(), // contenedor (tipo de bandeja)

  // Fechas
  fechaSugeridaSiembra: z.string(), // f_siem
  fechaSiembraReal: z.string(), // f_siembra
});

export type SiembraDto = z.infer<typeof SiembraDtoSchema>;
