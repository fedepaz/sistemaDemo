// shared/src/schemas/alerts.schema.ts

import { z } from "zod";

export const SiembraRetrasadaDtoSchema = z.object({
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  codigoEspecie: z.string(),
  nombreEspecie: z.string(),
  injerto: z.string(),
  nrocont: z.string(),
  contenedor: z.string(),
  semSiembra: z.string(),
  fechaSugeridaSiembra: z.string(),
  fSiembra: z.number(),
  semEntrega: z.string(),
  fEnt: z.string(),
  estado: z.string(),
  commentCount: z.number().default(0),
});

export type SiembraRetrasadaDto = z.infer<typeof SiembraRetrasadaDtoSchema>;

export const FaltaGerminacionDtoSchema = z.object({
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  codigoEspecie: z.string(),
  nombreEspecie: z.string(),
  injerto: z.string(),
  nrocont: z.string(),
  contenedor: z.string(),
  fPrimer: z.string(),
  pr: z.string(),
  commentCount: z.number().default(0),
});

export type FaltaGerminacionDto = z.infer<typeof FaltaGerminacionDtoSchema>;

export const FaltantePlantasDtoSchema = z.object({
  hai: z.string(),
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  codigoEspecie: z.string(),
  nombreEspecie: z.string(),
  nrocont: z.string(),
  contenedor: z.string(),
  solicito: z.number(),
  fPrimer: z.string(),
  pr: z.string(),
  stIniPr: z.string(),
  porPr: z.number(),
  commentCount: z.number().default(0),
});

export type FaltantePlantasDto = z.infer<typeof FaltantePlantasDtoSchema>;

export const FaltaPreExpedicionDtoSchema = z.object({
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  codigoEspecie: z.string(),
  nombreEspecie: z.string(),
  injerto: z.string(),
  nrocont: z.string(),
  contenedor: z.string(),
  fPreexp: z.string(),
  pe: z.number(),
  commentCount: z.number().default(0),
});

export type FaltaPreExpedicionDto = z.infer<typeof FaltaPreExpedicionDtoSchema>;

// ============================================================================
// ALERT COMMENTS
// ============================================================================

export const AlertCommentSchema = z.object({
  id: z.string(),
  alertType: z.string(),
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  content: z.string(),
  userId: z.string(),
  userName: z.string(),
  createdAt: z.string(),
});

export type AlertCommentDto = z.infer<typeof AlertCommentSchema>;

export const CreateAlertCommentSchema = z.object({
  alertType: z.enum(["SIEMBRA_RETRASADA", "FALTANTE_PLANTAS"]),
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  content: z
    .string()
    .min(1, { message: "El comentario no puede estar vacío" })
    .max(500, { message: "Máximo 500 caracteres" }),
});

export type CreateAlertCommentDto = z.infer<typeof CreateAlertCommentSchema>;
