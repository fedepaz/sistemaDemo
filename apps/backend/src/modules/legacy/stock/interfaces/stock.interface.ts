// src/modules/legacy/stock/interfaces/stock.interface.ts

import { RowDataPacket } from 'mysql2/promise';

export interface StockTotal extends RowDataPacket {
  total_entradas: number;
  total_salidas: number;
}
