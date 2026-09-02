import { z } from "zod";

export const LegacyHeaderSchema = z.object({
  partidaId: z.number({ required_error: "La partida es requerida" }),
  anio: z.number({ required_error: "El año es requerido" }),
  indice: z.number({ required_error: "El índice es requerido" }),
  codigoEspecie: z.string().min(1, { message: "El código de especie es requerido" }),
  nombreEspecie: z.string().min(1, { message: "El nombre de especie es requerido" }),
});

export type LegacyHeader = z.infer<typeof LegacyHeaderSchema>;

export const PartidaHeaderSchema = z.object({
  partidaId: z.number({ required_error: "La partida es requerida" }),
  anio: z.number({ required_error: "El año es requerido" }),
  indice: z.number({ required_error: "El índice es requerido" }),
});

export type PartidaHeader = z.infer<typeof PartidaHeaderSchema>;
