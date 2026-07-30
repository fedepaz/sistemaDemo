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
});

export type FaltaPreExpedicionDto = z.infer<typeof FaltaPreExpedicionDtoSchema>;
