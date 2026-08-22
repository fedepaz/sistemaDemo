import { z } from "zod";
import { LegacyHeaderSchema } from "./legacy-header.schema";

export const ExtendidoDtoSchema = LegacyHeaderSchema.extend({
  hai: z.string(),
  injerto: z.string(),
  nrocont: z.string(),
  codigoCamaraGerminacion: z.number(),
  fechaSugeridaSiembra: z.string(),
  fechaSiembraReal: z.string(),
  diasEnCamara: z.number(),
  fechaEgresoCamara: z.string(),
  extendido: z.string(),
  codigoUbicacion: z.number().nullable(),
  nombreUbicacion: z.string().nullable(),
  stockInicial: z.number().nullable(),
  detalle: z.string().nullable(),
  baja: z.string().nullable(),
});

export type ExtendidoDto = z.infer<typeof ExtendidoDtoSchema>;
