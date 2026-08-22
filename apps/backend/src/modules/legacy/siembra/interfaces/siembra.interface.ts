// src/modules/legacy/siembra/interfaces/siembra.interface.ts

import { RowDataPacket } from 'mysql2/promise';

export interface LegacySiembra extends RowDataPacket {
  partida: number;
  ano: number;
  indice: number;
  planta: string;
  nombre: string;
  hai: string;
  injerto: string;
  con: string;

  f_siem: string;
  f_siembra: string;
}

export interface LegacySiembraFecha extends RowDataPacket {
  fechaEgreso: string;
}
