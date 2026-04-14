// src/modules/legacy/depositos/interfaces/depositos.interface.ts

import { RowDataPacket } from 'mysql2/promise';

export interface LegacyDeposito extends RowDataPacket {
  codigo: number;
  nombre: string;
  camara: string;
  bandejas: number;
}
