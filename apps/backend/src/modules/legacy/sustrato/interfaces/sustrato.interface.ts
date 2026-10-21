import { RowDataPacket } from 'mysql2/promise';

export interface LegacySustrato extends RowDataPacket {
  codigo: string;
  nombre: string;
  unidad: string;
}

export interface LegacyProducto extends RowDataPacket {
  codigo: string;
  nombre: string;
  unidad: string;
}
