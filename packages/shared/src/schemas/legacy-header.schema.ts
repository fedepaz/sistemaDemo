import { z } from "zod";

export const LegacyHeaderSchema = z.object({
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  codigoEspecie: z.string(),
  nombreEspecie: z.string(),
});

export type LegacyHeader = z.infer<typeof LegacyHeaderSchema>;

export const PartidaHeaderSchema = z.object({
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
});

export type PartidaHeader = z.infer<typeof PartidaHeaderSchema>;
