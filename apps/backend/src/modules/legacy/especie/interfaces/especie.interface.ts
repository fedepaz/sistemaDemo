// src/modules/legacy/especie/interfaces/especie.interface.ts

import { RowDataPacket } from 'mysql2/promise';

export interface LegacyEspecie extends RowDataPacket {
  codigo: string; // char(5)
  nombre: string; // char(30)
  germinacio: string; // decimal(5.2)
  ger_inj: string; // decimal(5.2)
  rubro: string; // char(5)
  costo_p: string; // decimal(12.4)
  venta_d: string; // decimal(12.4)
}
