// shared/src/schemas/alerts.schema.ts

import { z } from "zod";

// ============================================================================
// ALERT BASE (shared across all alert types)
// ============================================================================

export const AlertPartidaHeaderSchema = z.object({
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  codigoEspecie: z.string(),
  nombreEspecie: z.string(),
});

export const AlertBaseDtoSchema = AlertPartidaHeaderSchema.extend({
  commentCount: z.number().default(0),
});

export type AlertBaseDto = z.infer<typeof AlertBaseDtoSchema>;

// ============================================================================
// SIEMBRA RETRASADA
// ============================================================================

export const SiembraRetrasadaDtoSchema = AlertBaseDtoSchema.extend({
  injerto: z.string(),
  nrocont: z.string(),
  semSiembra: z.string(),
  fechaSugeridaSiembra: z.string(),
  fSiembra: z.number(),
  semEntrega: z.string(),
  fEnt: z.string(),
  estado: z.string(),
  propiedad: z.string(),
});

export type SiembraRetrasadaDto = z.infer<typeof SiembraRetrasadaDtoSchema>;

// ============================================================================
// FALTA GERMINACION
// ============================================================================

export const FaltaGerminacionDtoSchema = AlertBaseDtoSchema.extend({
  injerto: z.string(),
  nrocont: z.string(),
  fPrimer: z.string(),
  pr: z.string(),
});

export type FaltaGerminacionDto = z.infer<typeof FaltaGerminacionDtoSchema>;

// ============================================================================
// FALTANTE PLANTAS
// ============================================================================

export const FaltantePlantasDtoSchema = AlertBaseDtoSchema.extend({
  siembras: z.number(),
  nrocont: z.string(),
  solicito: z.number(),
  producido: z.number(),
  diferencia: z.number(),
});

export type FaltantePlantasDto = z.infer<typeof FaltantePlantasDtoSchema>;

// ============================================================================
// FALTA PRE-EXPEDICION
// ============================================================================

export const FaltaPreExpedicionDtoSchema = AlertBaseDtoSchema.extend({
  injerto: z.string(),
  nrocont: z.string(),
  fPreexp: z.string(),
  pe: z.number(),
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
  alertType: z.enum([
    "SIEMBRA_RETRASADA",
    "FALTA_GERMINACION",
    "FALTANTE_PLANTAS",
    "FALTA_PRE_EXPEDICION",
  ]),
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  content: z
    .string()
    .min(1, { message: "El comentario no puede estar vacío" })
    .max(500, { message: "Máximo 500 caracteres" }),
});

export type CreateAlertCommentDto = z.infer<typeof CreateAlertCommentSchema>;
