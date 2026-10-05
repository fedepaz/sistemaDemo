// src/modules/legacy/tipoContenedor/interfaces/tipoContenedor.interface.ts

import { RowDataPacket } from 'mysql2/promise';

export interface LegacyTipoContenedor extends RowDataPacket {
  codigo: string;
  nombre: string;
  cantidad: number;
  semillas: number;
  siembra: string;
  entrega: number;
  rubro: string;
  stock: string;
}
