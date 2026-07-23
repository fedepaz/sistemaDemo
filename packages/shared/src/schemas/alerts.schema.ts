// shared/src/schemas/alerts.schema.ts
import { z } from "zod";

// ============================================================================
// SIEMBRA RETRASADA
// Partidas que no se han sembrado en la semana programada
// ============================================================================

export const SiembraRetrasadaDtoSchema = z.object({
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  codigoEspecie: z.string(),
  nombreEspecie: z.string(),
  fechaSugeridaSiembra: z.string(),
  contenedor: z.string(),
  con: z.number(),
});

export type SiembraRetrasadaDto = z.infer<typeof SiembraRetrasadaDtoSchema>;

// ============================================================================
// FALTA RECUENTO GERMINACION
// Partidas que estando en fecha, no cuentan con dato de germinación
// ============================================================================

export const FaltaGerminacionDtoSchema = z.object({
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  codigoEspecie: z.string(),
  nombreEspecie: z.string(),
  contenedor: z.string(),
  invernadero: z.string(),
});

export type FaltaGerminacionDto = z.infer<typeof FaltaGerminacionDtoSchema>;

// ============================================================================
// FALTANTE ESTIMADO DE PLANTAS
// Partidas donde plantas germinadas < solicitadas
// ============================================================================

export const FaltantePlantasDtoSchema = z.object({
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  codigoEspecie: z.string(),
  nombreEspecie: z.string(),
  solicitadas: z.number(),
  germinadasTotales: z.number(),
  invernadero: z.string(),
});

export type FaltantePlantasDto = z.infer<typeof FaltantePlantasDtoSchema>;

// ============================================================================
// FALTA PRE-EXPEDICION
// Partidas sin pre-expedición cargada (muestra los miércoles)
// ============================================================================

export const FaltaPreExpedicionDtoSchema = z.object({
  partidaId: z.number(),
  anio: z.number(),
  indice: z.number(),
  codigoEspecie: z.string(),
  nombreEspecie: z.string(),
  fechaEntrega: z.string(),
  invernadero: z.string(),
});

export type FaltaPreExpedicionDto = z.infer<typeof FaltaPreExpedicionDtoSchema>;
