// src/modules/legacy/tratamiento/interfaces/tratamiento.interface.ts

import { RowDataPacket } from 'mysql2/promise';

export interface LegacyTratamiento extends RowDataPacket {
  codigo: string;
  nombre: string;
  precio: string;
}
