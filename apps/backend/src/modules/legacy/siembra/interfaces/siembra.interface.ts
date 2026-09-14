// src/modules/legacy/siembra/interfaces/siembra.interface.ts

import { RowDataPacket } from 'mysql2/promise';

export interface LegacySiembra extends RowDataPacket {
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
  lote: string;
  ano_lote: string;
  item: number;
  semxgr: string;
  c: string;
  g: string;
}

export interface LegacySiembraFecha extends RowDataPacket {
  fechaEgreso: string;
}
