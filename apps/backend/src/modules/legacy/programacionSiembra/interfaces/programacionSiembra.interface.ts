// src/modules/legacy/programacionSiembra/interfaces/programacionSiembra.interface.ts

import { RowDataPacket } from 'mysql2/promise';

export interface LegacyProgramacionSiembra extends RowDataPacket {
  partida: number;
  ano: number;
  indice: number;
  planta: string;
  nombre: string;

  propiedad: string;
  injerto: string;
  nrocont: string;
  sem_siembra: string;
  f_siem: string;
  f_siembra: string;
  semEntrega: string;
  lote: string;
  ano_lote: string;
  item: number;
  semxgr: string;
  c: string;
  g: string;
}

export interface LegacyProgramacionSiembraFecha extends RowDataPacket {
  fechaEgreso: string;
}
