import { z } from 'zod';

/**
 * Schema for a Partida record from the legacy system.
 * Includes all fields found in the legacy database.
 */
export const PartidaSchema = z.object({
  partida: z.number(),
  ano: z.number(),
  indice: z.number(),
  fecha: z.string(), // Format 'YYYY-MM-DD'
  espvar: z.string(),
  contenedor: z.string(),
  hai: z.string(),
  injerto: z.string(),
  v_pi: z.string(),
  sem_siem: z.number(),
  ano_siem: z.number(),
  f_siem: z.string(),
  sem_ent: z.number(),
  ano_ent: z.number(),
  i_f: z.string(),
  f_ent: z.string(),
  propiedad: z.string(),
  tratamien: z.string(),
  solicito: z.number(),
  lote: z.number(),
  ano_lote: z.number(),
  item: z.number(),
  semxgr: z.string(),
  camara: z.string(),
  germin: z.string(),
  ger_inj: z.string(),
  ajuste: z.string(),
  semxger: z.number(),
  cantidad: z.number(),
  f_siembra: z.string(),
  cantcont: z.number(),
  semillas: z.number(),
  nrocont: z.number(),
  cont_s: z.string(),
  cant_s: z.number(),
  cont_e: z.string(),
  cant_e: z.number(),
  f_transp: z.string(),
  pl_transp: z.number(),
  f_primer: z.string(),
  f_preexp: z.string(),
  stock: z.number(),
  con: z.number(),
  st_ini_pr: z.number(),
  st_ini: z.number(),
  cg: z.number(),
  pr: z.string(),
  pe: z.string(),
  extendido: z.string(),
  estado: z.string(),
  f_injerto: z.string(),
  pl_injerto: z.number(),
  f_rusticar: z.string(),
  pl_control: z.number(),
  pl_stock: z.number(),
  f_envio: z.string(),
  ctr_causa: z.string(),
  ctr_fecha: z.string(),
  ctr_visto: z.string(),
  ctr_txt: z.string(),
});

/**
 * Data Transfer Object for Partida records.
 * Used for communication between backend and frontend.
 */
export type PartidaDto = z.infer<typeof PartidaSchema>;
