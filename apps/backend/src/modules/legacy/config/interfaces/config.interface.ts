// src/modules/legacy/config/interfaces/config.interface.ts

import { RowDataPacket } from 'mysql2/promise';

export interface LegacyConfig extends RowDataPacket {
  codigo: string;
  nombre: string;
}
