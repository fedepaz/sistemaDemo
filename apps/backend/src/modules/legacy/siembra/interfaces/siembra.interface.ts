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

  f_siem: string;
  propiedad: string;
  solicito: string;
  nrocont: string;
  extendido: string;
  germin: string;
}

export interface LegacySiembraFecha extends RowDataPacket {
  fechaEgreso: string;
}
