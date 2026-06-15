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
  cg: number;
  f_siem: string;
  f_siembra: string;
  diasCamara: number;
  fechaEgresoCamara: string; // DATE_ADD(...)
  extendido: string;
  ubicacion: number | null;
  nomubicacion: string | null;
  stock_ini: number | null;
  detalle: string | null;
  baja: string | null;
}

export interface LegacySiembraFecha extends RowDataPacket {
  fechaEgreso: string;
}
