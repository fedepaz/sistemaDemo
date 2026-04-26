// src/modules/legacy/partidas/interfaces/partidas.interface.ts

import { RowDataPacket } from 'mysql2/promise';

export interface LegacyPartidas extends RowDataPacket {
  partida: number;
  ano: number;
  indice: number;
  fecha: string; // formato 'YYYY-MM-DD'
  espvar: string;
  contenedor: string;
  hai: string;
  injerto: string;
  v_pi: string;
  sem_siem: number;
  ano_siem: number;
  f_siem: string; // 'YYYY-MM-DD'
  sem_ent: number;
  ano_ent: number;
  i_f: string;
  f_ent: string; // 'YYYY-MM-DD'
  propiedad: string;
  tratamien: string;
  solicito: number;
  lote: number;
  ano_lote: number;
  item: number;
  semxgr: string; // valor como "0.0", "2352.0"
  camara: string; // "0.0", "7.0"
  germin: string; // "80.00"
  ger_inj: string; // "0.00"
  ajuste: string; // "86.00"
  semxger: number;
  cantidad: number;
  f_siembra: string; // 'YYYY-MM-DD'
  cantcont: number;
  semillas: number;
  nrocont: number;
  cont_s: string;
  cant_s: number;
  cont_e: string;
  cant_e: number;
  f_transp: string; // 'YYYY-MM-DD' o '0000-00-00'
  pl_transp: number;
  f_primer: string; // 'YYYY-MM-DD'
  f_preexp: string; // 'YYYY-MM-DD'
  stock: number;
  con: number;
  st_ini_pr: number;
  st_ini: number;
  cg: number;
  pr: string; // "73.81"
  pe: string; // "74.02"
  extendido: string;
  estado: string;
  f_injerto: string; // 'YYYY-MM-DD' o '0000-00-00'
  pl_injerto: number;
  f_rusticar: string; // 'YYYY-MM-DD' o '0000-00-00'
  pl_control: number;
  pl_stock: number;
  f_envio: string; // 'YYYY-MM-DD' o '0000-00-00'
  ctr_causa: string;
  ctr_fecha: string; // puede ser "1" o vacío
  ctr_visto: string;
  ctr_txt: string;
}
