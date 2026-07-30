// src/modules/legacy/siembra/interfaces/siembra.interface.ts

import { RowDataPacket } from 'mysql2/promise';

export interface LegacySiembra extends RowDataPacket {
  partida: number;
  ano: number;
  indice: number;

  hai: string;
  con: number;
  espvar: string;
  especieNombre: string;
  injerto: string;
  contenedor: string;

  f_siem: string;
  f_siembra: string;
}

export interface LegacySiembraFecha extends RowDataPacket {
  fechaEgreso: string;
}
