// src/modules/legacy/stock/stock.service.ts

import { Injectable } from '@nestjs/common';
import type { PoolConnection } from 'mysql2/promise';
import { StockRepository } from './repositories/stock.repository';
import { StockTotal } from './interfaces/stock.interface';

@Injectable()
export class LegacyStockService {
  constructor(private readonly repository: StockRepository) {}

  async stockTotal(
    lote: number,
    anio: number,
    item: number,
    conn?: PoolConnection,
  ): Promise<StockTotal[]> {
    return this.repository.stockTotal(lote, anio, item, conn);
  }

  async updateStock(
    lote: number,
    anio: number,
    item: number,
    conn?: PoolConnection,
  ): Promise<{ entradas: number; salidas: number }> {
    return this.repository.updateStock(lote, anio, item, conn);
  }
}
