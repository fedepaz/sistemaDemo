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
  codigoCamaraGerminacion: z.number(), // cg (código de cámara de germinación)

  // Fechas
  fechaSugeridaSiembra: z.string(), // f_siem
  fechaSiembraReal: z.string(), // f_siembra
  diasEnCamara: z.number(), // diasCamara
  fechaEgresoCamara: z.string(), // fechaEgresoCamara (calculada)

  // Extendido (texto)
  extendido: z.string(), // extendido (observaciones)

  // Datos de ubicación final (partidas2)
  codigoUbicacion: z.number().nullable(), // ubicacion (código de depósito)
  nombreUbicacion: z.string().nullable(), // nomubicacion
  stockInicial: z.number().nullable(), // stock_ini
  detalle: z.string().nullable(), // detalle
  baja: z.string().nullable(), // baja
});

export type SiembraDto = z.infer<typeof SiembraDtoSchema>;
