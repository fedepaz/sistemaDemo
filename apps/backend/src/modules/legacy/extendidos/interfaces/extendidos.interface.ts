// src/modules/legacy/extendidos/interfaces/extendidos.interface.ts

import { RowDataPacket } from 'mysql2/promise';

export interface LegacyExtendido extends RowDataPacket {
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
