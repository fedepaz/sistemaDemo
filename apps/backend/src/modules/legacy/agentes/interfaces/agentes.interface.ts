// src/modules/legacy/agentes/interfaces/agentes.interface.ts

import { RowDataPacket } from 'mysql2/promise';

export interface LegacyAgent extends RowDataPacket {
  codigo: number;
  nombre: string;
}
