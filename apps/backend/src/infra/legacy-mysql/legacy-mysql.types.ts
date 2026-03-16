import { RowDataPacket } from 'mysql2';

export interface LegacyAgent extends RowDataPacket {
  codigo: number;
  nombre: string;
}

export interface LegacyOperation extends RowDataPacket {
  codigo: string;
}
