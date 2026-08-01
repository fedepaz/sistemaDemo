import { RowDataPacket } from 'mysql2/promise';

export interface LegacySiembraRetrasada extends RowDataPacket {
  partida: number;
  ano: number;
  indice: number;
  planta: string;
  nombre: string;
  injerto: string;
  nrocont: string;
  semSiembra: string;
  f_siem: string;
  f_siembra: number;
  semEntrega: string;
  f_ent: string;
  estado: string;
}

export interface LegacyFaltaGerminacion extends RowDataPacket {
  partida: number;
  ano: number;
  indice: number;
  planta: string;
  nombre: string;
  injerto: string;
  nrocont: string;
  f_primer: string;
  pr: string;
}

export interface LegacyFaltantePlantas extends RowDataPacket {
  hai: string;
  partida: number;
  ano: number;
  indice: number;
  planta: string;
  nombre: string;
  nrocont: string;
  solicito: number;
  f_primer: string;
  pr: string;
  st_ini_pr: string;
  porPr: number;
}

export interface LegacyFaltaPreExpedicion extends RowDataPacket {
  partida: number;
  ano: number;
  indice: number;
  planta: string;
  nombre: string;
  injerto: string;
  nrocont: string;
  f_preexp: string;
  pe: number;
}
