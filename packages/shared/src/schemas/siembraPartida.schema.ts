// shared/src/schemas/siembraPartida.ts

import { z } from "zod";

export const SiembraPartidaSchema = z.object({
  id: z.string(),
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  metodoMaquina: z.boolean(),
  mezclaId: z.string(),
  userId: z.string(),
});

export type SiembraPartidaDto = z.infer<typeof SiembraPartidaSchema>;

export const CreateSiembraPartidaSchema = z.object({
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  metodoMaquina: z.boolean(),
  mezclaId: z.string(),
  userId: z.string(),
});

export type CreateSiembraPartidaDto = z.infer<
  typeof CreateSiembraPartidaSchema
>;
