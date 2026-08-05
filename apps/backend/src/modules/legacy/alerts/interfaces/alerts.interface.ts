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
  propiedad: string;
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
  partida: number;
  ano: number;
  siembras: number;
  planta: string;
  nombre: string;
  nrocont: string;
  solicito: number;
  produido: number;
  diferencia: number;
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
