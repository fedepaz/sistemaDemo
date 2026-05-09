// src/modules/legacy/partidas/interfaces/partidas2.interface.ts

import { RowDataPacket } from 'mysql2/promise';

export interface LegacyPartidas2 extends RowDataPacket {
  partida: number; // example 8796
  ano: number; // example 2025
  indice: number; // example  0,
  fecha: string; // example  "2025-01-07",
  ubicacion: number; // example  7,
  stock_ini: number; // example  504,
  concepto: number; // example  0,
  detalle: string; // example  "0.00",
  baja: number; // example  2,
  stock: number; // example  502,
  f_pr: string; // example  "2025-01-07",
  pr: string; // example  "99.00",
  stxpr: number; // example  1,
  repique: number; // example  0,
  pl_repique: number; // example  0,
  f_re: string; // example  "0000-00-00",
  f_pe: string; // example  "0000-00-00",
  pe: string; // example  "0.00",
  stxcont: number; // example  0,
  fin: string; // example  "",
}
