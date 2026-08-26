import { z } from 'zod';
import { CreateSiembraPartidaSchema } from './siembraPartida.schema';

export const LegacyHeaderSchema = z.object({
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  codigoEspecie: z.string(),
  nombreEspecie: z.string(),
});

export type LegacyHeader = z.infer<typeof LegacyHeaderSchema>;

export const SiembraCompletaHeaderSchema = LegacyHeaderSchema.merge(
  CreateSiembraPartidaSchema.omit({ partidaId: true, anio: true, indice: true })
);

export type SiembraCompletaHeader = z.infer<typeof SiembraCompletaHeaderSchema>;
