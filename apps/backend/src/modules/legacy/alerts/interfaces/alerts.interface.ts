// src/modules/legacy/alerts/interfaces/alerts.interface.ts

import { RowDataPacket } from 'mysql2/promise';

export interface LegacySiembraRetrasada extends RowDataPacket {
  partida: number;
  ano: number;
  indice: number;
  espvar: string;
  especieNombre: string;
  f_siem: string;
  contenedor: string;
  con: number;
}

export interface LegacyFaltaGerminacion extends RowDataPacket {
  partida: number;
  ano: number;
  indice: number;
  espvar: string;
  especieNombre: string;
  contenedor: string;
  invernadero: string;
}

export interface LegacyFaltantePlantas extends RowDataPacket {
  partida: number;
  ano: number;
  indice: number;
  espvar: string;
  especieNombre: string;
  solicitadas: number;
  germinadasTotales: number;
  invernadero: string;
}

export interface LegacyFaltaPreExpedicion extends RowDataPacket {
  partida: number;
  ano: number;
  indice: number;
  espvar: string;
  especieNombre: string;
  fechaEntrega: string;
  invernadero: string;
}
